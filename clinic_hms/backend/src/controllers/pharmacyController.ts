import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendWhatsAppMessage } from '../services/whatsappService';

// @desc    Get all pending prescriptions
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacist)
export const getPendingPrescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { status: 'PENDING' },
      include: {
        consultation: {
          include: { patient: true, doctor: true },
        },
        items: {
          include: { medicine: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving prescriptions' });
  }
};

// @desc    Dispense medicine & auto-update inventory
// @route   POST /api/pharmacy/dispense
// @access  Private (Pharmacist)
export const dispensePrescription = async (req: Request, res: Response): Promise<void> => {
  const { prescriptionId } = req.body;

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
        consultation: { include: { patient: true } },
      },
    });

    if (!prescription) {
      res.status(404).json({ message: 'Prescription not found' });
      return;
    }

    if (prescription.status === 'DISPENSED') {
      res.status(400).json({ message: 'Prescription already dispensed' });
      return;
    }

    // Interactive Transaction for Inventory Update
    await prisma.$transaction(async (tx) => {
      // 1. Deduct Stock
      for (const item of prescription.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 2. Mark Prescription as Dispensed
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: 'DISPENSED' },
      });
    });

    await sendWhatsAppMessage(
      prescription.consultation.patient.phone,
      `Hello ${prescription.consultation.patient.name}, your medicines have been dispensed. Please proceed to the billing counter.`
    );

    res.json({ success: true, message: 'Medicines dispensed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error dispensing medicines' });
  }
};

// @desc    Get Inventory Details
// @route   GET /api/pharmacy/inventory
// @access  Private
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const inventory = await prisma.medicine.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching inventory' });
  }
};

// @desc    Add new medicine to inventory
// @route   POST /api/pharmacy/inventory
// @access  Private (Pharmacist/Admin)
export const addMedicine = async (req: Request, res: Response): Promise<void> => {
  const { name, stock, price } = req.body;

  try {
    const medicineExists = await prisma.medicine.findUnique({ where: { name } });
    if (medicineExists) {
      res.status(400).json({ message: 'Medicine with this name already exists' });
      return;
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding medicine' });
  }
};

// @desc    Update medicine details
// @route   PUT /api/pharmacy/inventory/:id
// @access  Private (Pharmacist/Admin)
export const updateMedicine = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, stock, price } = req.body;

  try {
    const medicine = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: {
        name,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });

    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating medicine' });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/pharmacy/inventory/:id
// @access  Private (Pharmacist/Admin)
export const deleteMedicine = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if medicine has been prescribed (to prevent foreign key violations or data loss)
    const prescriptionItem = await prisma.prescriptionItem.findFirst({
      where: { medicineId: parseInt(id) }
    });

    if (prescriptionItem) {
      res.status(400).json({ message: 'Cannot delete medicine that has already been prescribed' });
      return;
    }

    await prisma.medicine.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting medicine' });
  }
};
