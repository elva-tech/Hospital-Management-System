const { Patient, Doctor, Medicine, Consultation, Prescription, DiagnosisRequest, DiagnosisReport, PharmacySale } = require('../models');

// @desc    Get all data from all collections for debugging/demo
// @route   GET /api/debug/all-data
const getAllData = async (req, res, next) => {
  try {
    const data = {
      patients: await Patient.find(),
      doctors: await Doctor.find(),
      medicines: await Medicine.find(),
      consultations: await Consultation.find().populate('patient_id doctor_id'),
      prescriptions: await Prescription.find().populate('consultation_id'),
      diagnosis_requests: await DiagnosisRequest.find().populate('consultation_id'),
      diagnosis_reports: await DiagnosisReport.find().populate('request_id'),
      pharmacy_sales: await PharmacySale.find().populate('prescription_id medicine_id')
    };

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllData };
