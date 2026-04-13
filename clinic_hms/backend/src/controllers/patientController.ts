import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendWhatsAppMessage } from '../services/whatsappService';

// @desc    Register a new patient or fetch existing, then add to queue
// @route   POST /api/patients/register
// @access  Private (Receptionist)
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  const { phone, name, age, gender, address } = req.body;

  try {
    // 1. Find or create patient
    let patient = await prisma.patient.findUnique({ where: { phone } });
    let isNew = false;

    if (!patient) {
      patient = await prisma.patient.create({
        data: { phone, name, age, gender, address },
      });
      isNew = true;
      
      await sendWhatsAppMessage(
        phone, 
        `Welcome to our Clinic, ${name}! Your registration is successful.`
      );
    }

    // 2. Add to today's Queue
    // Get highest token number today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const latestQueue = await prisma.queue.findFirst({
      where: { date: { gte: startOfDay } },
      orderBy: { tokenNumber: 'desc' },
    });

    const tokenNumber = latestQueue ? latestQueue.tokenNumber + 1 : 1;

    const queueEntry = await prisma.queue.create({
      data: {
        patientId: patient.id,
        tokenNumber,
      },
    });

    await sendWhatsAppMessage(
      phone,
      `Hello ${patient.name}, you have been added to the queue today.\nYour Token Number is: *${tokenNumber}*.\nPlease wait for your turn.`
    );

    res.status(201).json({
      success: true,
      data: { patient, queue: queueEntry, isNew },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Get patient by phone
// @route   GET /api/patients/:phone
// @access  Private
export const getPatientByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { phone: req.params.phone as string },
      include: {
        consultations: { orderBy: { date: 'desc' } },
      },
    });

    if (patient) {
      res.json({ success: true, data: patient });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
