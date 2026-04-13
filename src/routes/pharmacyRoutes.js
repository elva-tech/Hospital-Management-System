const express = require('express');
const { check } = require('express-validator');
const { generateToken, getPatientPrescriptions, dispenseMedicine } = require('../controllers/pharmacyInventoryController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/token',
  [
    check('prescription_id', 'Prescription ID is required').isMongoId(),
    validate
  ],
  generateToken
);

router.get('/prescriptions/:patient_id', getPatientPrescriptions);

router.post(
  '/dispense',
  [
    check('prescription_id', 'Prescription ID is required').isMongoId(),
    check('items', 'Items are required').isArray({ min: 1 }),
    check('items.*.medicine_id', 'Medicine ID is required').isMongoId(),
    check('items.*.quantity', 'Quantity is required').isNumeric(),
    validate
  ],
  dispenseMedicine
);

module.exports = router;
