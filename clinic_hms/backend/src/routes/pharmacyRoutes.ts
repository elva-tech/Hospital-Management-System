import express from 'express';
import { getPendingPrescriptions, dispensePrescription, getInventory, addMedicine, updateMedicine, deleteMedicine } from '../controllers/pharmacyController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/prescriptions', protect, authorize('PHARMACIST', 'ADMIN'), getPendingPrescriptions);
router.post('/dispense', protect, authorize('PHARMACIST', 'ADMIN'), dispensePrescription);
router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, authorize('PHARMACIST', 'ADMIN'), addMedicine);
router.put('/inventory/:id', protect, authorize('PHARMACIST', 'ADMIN'), updateMedicine);
router.delete('/inventory/:id', protect, authorize('PHARMACIST', 'ADMIN'), deleteMedicine);

export default router;
