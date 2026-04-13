const express = require('express');
const { check } = require('express-validator');
const { addInventory, getInventoryStatus, sendNotification } = require('../controllers/pharmacyInventoryController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Inventory
router.post(
  '/inward',
  [
    check('medicine_id', 'Medicine ID is required').isMongoId(),
    check('quantity', 'Quantity is required').isNumeric(),
    validate
  ],
  addInventory
);

router.get('/', getInventoryStatus);

// Notifications
router.post(
  '/send',
  [
    check('user_id', 'User ID is required').isMongoId(),
    check('message', 'Message is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty(),
    validate
  ],
  sendNotification
);

module.exports = router;
