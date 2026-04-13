const { DiagnosisRequest, DiagnosisReport, Consultation } = require('../../models/mongodb');

// @desc    Refer for diagnosis
// @route   POST /api/diagnosis/request
const requestDiagnosis = async (req, res, next) => {
  try {
    const { consultation_id, test_name } = req.body;

    const consultation = await Consultation.findById(consultation_id);
    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    const request = await DiagnosisRequest.create({
      consultation_id,
      test_name
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all diagnosis requests
// @route   GET /api/diagnosis/requests
const getDiagnosisRequests = async (req, res, next) => {
  try {
    const requests = await DiagnosisRequest.find()
      .populate('consultation_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload diagnosis report
// @route   POST /api/diagnosis/report
const uploadReport = async (req, res, next) => {
  try {
    const { request_id, report_url, result } = req.body;

    const request = await DiagnosisRequest.findById(request_id);
    if (!request) {
      res.status(404);
      throw new Error('Diagnosis request not found');
    }

    const report = await DiagnosisReport.create({
      request_id,
      report_url,
      result
    });

    request.status = 'Completed';
    await request.save();

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestDiagnosis,
  getDiagnosisRequests,
  uploadReport
};
