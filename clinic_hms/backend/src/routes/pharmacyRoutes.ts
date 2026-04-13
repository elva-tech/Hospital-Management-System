import express from 'express';
import { getPendingPrescriptions, dispensePrescription, getInventory } from '../controllers/pharmacyController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/prescriptions', protect, authorize('PHARMACIST', 'ADMIN'), getPendingPrescriptions);
router.post('/dispense', protect, authorize('PHARMACIST', 'ADMIN'), dispensePrescription);
router.get('/inventory', protect, getInventory);

export default router;
