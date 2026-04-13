import express from 'express';
import { createConsultation, createPrescription } from '../controllers/doctorController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/consultation', protect, authorize('DOCTOR'), createConsultation);
router.post('/prescription', protect, authorize('DOCTOR'), createPrescription);

export default router;
