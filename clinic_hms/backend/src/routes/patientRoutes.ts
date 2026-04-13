import express from 'express';
import { registerPatient, getPatientByPhone } from '../controllers/patientController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', protect, authorize('RECEPTIONIST', 'ADMIN'), registerPatient);
router.get('/:phone', protect, getPatientByPhone);

export default router;
