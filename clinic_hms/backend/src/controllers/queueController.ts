import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendWhatsAppMessage } from '../services/whatsappService';

// @desc    Add patient to queue manually (if already registered)
// @route   POST /api/queue/add
// @access  Private (Receptionist)
export const addToQueue = async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.body;

  try {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Check if already in queue today and not completed
    const existingEntry = await prisma.queue.findFirst({
      where: {
        patientId,
        date: { gte: startOfDay },
        status: { not: 'COMPLETED' },
      },
    });

    if (existingEntry) {
      res.status(400).json({ message: 'Patient is already in the queue today' });
      return;
    }

    const latestQueue = await prisma.queue.findFirst({
      where: { date: { gte: startOfDay } },
      orderBy: { tokenNumber: 'desc' },
    });

    const tokenNumber = latestQueue ? latestQueue.tokenNumber + 1 : 1;

    const queueEntry = await prisma.queue.create({
      data: {
        patientId,
        tokenNumber,
      },
    });

    await sendWhatsAppMessage(
      patient.phone,
      `Hello ${patient.name}, you have been added to the queue today.\nYour Token Number is: *${tokenNumber}*.\nPlease wait for your turn.`
    );

    res.status(201).json({ success: true, data: queueEntry });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's queue
// @route   GET /api/queue/today
// @access  Private
export const getTodayQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const queue = await prisma.queue.findMany({
      where: { date: { gte: startOfDay } },
      include: { patient: true },
      orderBy: { tokenNumber: 'asc' },
    });

    res.json({ success: true, data: queue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update queue status
// @route   PATCH /api/queue/status
// @access  Private (Doctor/Receptionist)
export const updateQueueStatus = async (req: Request, res: Response): Promise<void> => {
  const { queueId, status } = req.body;

  try {
    const queueEntry = await prisma.queue.update({
      where: { id: queueId },
      data: { status },
      include: { patient: true },
    });

    if (status === 'IN_CONSULTATION') {
      await sendWhatsAppMessage(
        queueEntry.patient.phone,
        `Hello ${queueEntry.patient.name}, the doctor is ready to see you now. Please proceed to the cabin.`
      );
    }

    res.json({ success: true, data: queueEntry });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating queue' });
  }
};
