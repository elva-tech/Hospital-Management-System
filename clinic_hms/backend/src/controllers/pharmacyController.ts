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
