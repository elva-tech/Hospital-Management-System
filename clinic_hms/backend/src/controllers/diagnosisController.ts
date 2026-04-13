import { Request, Response } from 'express';
import { prisma } from '../index';
import { sendWhatsAppMessage } from '../services/whatsappService';

// @desc    Request a lab test
// @route   POST /api/diagnosis/request
// @access  Private (Doctor)
export const createDiagnosisRequest = async (req: Request, res: Response): Promise<void> => {
  const { consultationId, testName } = req.body;

  try {
    const diagnosisRequest = await prisma.diagnosisRequest.create({
      data: {
        consultationId,
        testName,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: diagnosisRequest });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating lab request' });
  }
};

// @desc    Get all pending lab tests
// @route   GET /api/diagnosis/pending
// @access  Private (Doctor, Receptionist, Admin)
export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.diagnosisRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        consultation: {
          include: { patient: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending tests' });
  }
};

// @desc    Enter lab results and complete request
// @route   PATCH /api/diagnosis/results
// @access  Private (Receptionist, Admin)
export const updateDiagnosisResults = async (req: Request, res: Response): Promise<void> => {
  const { requestId, results, reportUrl } = req.body;

  try {
    const request = await prisma.diagnosisRequest.update({
      where: { id: requestId },
      data: {
        results,
        reportUrl,
        status: 'COMPLETED',
      },
      include: {
        consultation: {
          include: { patient: true }
        }
      }
    });

    // Notify Patient via WhatsApp
    const patientName = request.consultation.patient.name;
    const patientPhone = request.consultation.patient.phone;
    const msg = `Hello ${patientName}, your lab report for "${request.testName}" is ready. Results: ${results}. ${reportUrl ? 'View here: ' + reportUrl : ''}`;
    
    await sendWhatsAppMessage(patientPhone, msg);

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating results' });
  }
};

// @desc    Get history for a specific patient
// @route   GET /api/diagnosis/patient/:patientId
// @access  Private
export const getPatientDiagnosisHistory = async (req: Request, res: Response): Promise<void> => {
  const { patientId } = req.params;

  try {
    const requests = await prisma.diagnosisRequest.findMany({
      where: {
        consultation: {
          patientId: parseInt(patientId)
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching patient history' });
  }
};
