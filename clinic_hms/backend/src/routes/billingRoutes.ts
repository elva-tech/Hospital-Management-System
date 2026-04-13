import express from 'express';
import { getPatientBilling, payBill } from '../controllers/billingController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/:patientId', protect, authorize('RECEPTIONIST', 'ADMIN'), getPatientBilling);
router.post('/pay', protect, authorize('RECEPTIONIST', 'ADMIN'), payBill);

export default router;
