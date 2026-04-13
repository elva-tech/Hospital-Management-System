const express = require('express');
const router = express.Router();
const { createBilling, payBill, getPatientBills } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('Admin', 'Receptionist', 'Pharmacist'), createBilling);
router.post('/pay', protect, authorize('Admin', 'Receptionist'), payBill);
router.get('/:patient_id', protect, getPatientBills);

module.exports = router;
