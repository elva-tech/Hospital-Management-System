const express = require('express');
const { check } = require('express-validator');
const { createConsultation } = require('../controllers/consultationController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// @route   POST /api/consultations
router.post(
  '/',
  [
    check('patient_id', 'Patient ID is required').isMongoId(),
    check('doctor_id', 'Doctor ID is required').isMongoId(),
    check('symptoms', 'Symptoms are required').not().isEmpty(),
    check('diagnosis', 'Diagnosis is required').not().isEmpty(),
    validate
  ],
  createConsultation
);

module.exports = router;
