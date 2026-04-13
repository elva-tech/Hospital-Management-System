import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendWhatsAppMessage } from '../services/whatsappService';

// @desc    Generate Invoice / Fetch total due
// @route   GET /api/billing/:patientId
// @access  Private (Receptionist / Admin)
export const getPatientBilling = async (req: Request, res: Response): Promise<void> => {
  const patientId = parseInt(req.params.patientId as string);

  try {
    // Basic logic: Find latest active consultation without paid billing
    const billing = await prisma.billing.findFirst({
      where: { patientId, status: 'PENDING' },
      include: {
        consultation: {
          include: {
            prescription: {
              include: { items: { include: { medicine: true } } }
            }
          }
        }
      }
    });

    if (!billing) {
      // If no explicit pending billing, try to generate one based on the latest unbilled consultation
      const unbilledConsultation = await prisma.consultation.findFirst({
        where: { patientId, billing: null },
        include: {
          prescription: {
            include: { items: { include: { medicine: true } } }
          }
        },
        orderBy: { date: 'desc' }
      });

      if (!unbilledConsultation) {
         res.status(404).json({ message: 'No pending bills found for patient' });
         return;
      }

      // Calculate Amount: Base Consultation Fee + Medicine costs
      const baseFee = 500; // Flat 500 INR consultation fee
      let medicineCost = 0;

      if (unbilledConsultation.prescription && unbilledConsultation.prescription.status === 'DISPENSED') {
         unbilledConsultation.prescription.items.forEach(item => {
             medicineCost += (item.medicine.price * item.quantity);
         });
      }

      const totalAmount = baseFee + medicineCost;

      const newBilling = await prisma.billing.create({
        data: {
          patientId,
          consultationId: unbilledConsultation.id,
          amount: totalAmount,
        },
        include: { consultation: true }
      });

      res.json({ success: true, data: newBilling });
      return;
    }

    res.json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ message: 'Server error generating billing' });
  }
};

// @desc    Pay the bill
// @route   POST /api/billing/pay
// @access  Private
export const payBill = async (req: Request, res: Response): Promise<void> => {
  const { billingId, paymentMode } = req.body;

  try {
    const billing = await prisma.billing.update({
      where: { id: billingId },
      data: {
        status: 'PAID',
        paymentMode: paymentMode || 'CASH',
      },
      include: { patient: true }
    });

    // Send Digital Receipt via WhatsApp
    await sendWhatsAppMessage(
      billing.patient.phone,
      `Hello ${billing.patient.name},\nThanks for visiting us today.\nWe have received your payment of Rs. ${billing.amount} via ${billing.paymentMode}.\nStay healthy!`
    );

    res.json({ success: true, data: billing });
  } catch (error) {
    res.status(500).json({ message: 'Server error processing payment' });
  }
};
