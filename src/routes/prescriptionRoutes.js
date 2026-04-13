const express = require('express');
const { check } = require('express-validator');
const { createPrescription } = require('../controllers/prescriptionController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// @route   POST /api/prescriptions
router.post(
  '/',
  [
    check('consultation_id', 'Consultation ID is required').isMongoId(),
    check('items', 'Prescription items are required and must be an array').isArray({ min: 1 }),
    check('items.*.medicine_id', 'Medicine ID is required').isMongoId(),
    check('items.*.dosage', 'Dosage is required').not().isEmpty(),
    check('items.*.duration', 'Duration is required').not().isEmpty(),
    validate
  ],
  createPrescription
);

module.exports = router;
