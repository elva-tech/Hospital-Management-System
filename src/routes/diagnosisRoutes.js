const express = require('express');
const { check } = require('express-validator');
const { requestDiagnosis, uploadReport, getDiagnosisRequests } = require('../controllers/diagnosisController');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post(
  '/request',
  [
    check('consultation_id', 'Consultation ID is required').isMongoId(),
    check('test_name', 'Test name is required').not().isEmpty(),
    validate
  ],
  requestDiagnosis
);

router.post(
  '/report',
  [
    check('request_id', 'Request ID is required').isMongoId(),
    check('report_url', 'Report URL is required').not().isEmpty(),
    validate
  ],
  uploadReport
);

router.get('/requests', getDiagnosisRequests);

module.exports = router;
