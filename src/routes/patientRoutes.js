const express = require('express');
const { check } = require('express-validator');
const { registerPatient, getPatientHistory } = require('../controllers/patientController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// @route   POST /api/patients
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('age', 'Age is required and must be a number').isNumeric(),
    check('gender', 'Gender must be Male, Female, or Other').isIn(['Male', 'Female', 'Other']),
    check('phone', 'Phone is required').not().isEmpty(),
    validate
  ],
  registerPatient
);

// @route   GET /api/patients/:id/history
router.get('/:id/history', getPatientHistory);

module.exports = router;
