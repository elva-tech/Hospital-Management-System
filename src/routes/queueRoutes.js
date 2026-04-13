const express = require('express');
const router = express.Router();
const { addToQueue, getTodayQueue, updateQueueStatus } = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/add', protect, authorize('Admin', 'Receptionist'), addToQueue);
router.get('/today', protect, getTodayQueue);
router.patch('/status', protect, authorize('Admin', 'Receptionist', 'Doctor'), updateQueueStatus);

module.exports = router;
