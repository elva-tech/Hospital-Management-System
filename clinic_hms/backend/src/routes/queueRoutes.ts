import express from 'express';
import { addToQueue, getTodayQueue, updateQueueStatus } from '../controllers/queueController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/add', protect, authorize('RECEPTIONIST', 'ADMIN'), addToQueue);
router.get('/today', protect, getTodayQueue);
router.patch('/status', protect, authorize('DOCTOR', 'RECEPTIONIST', 'ADMIN'), updateQueueStatus);

export default router;
