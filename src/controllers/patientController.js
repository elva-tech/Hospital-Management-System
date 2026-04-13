const { Patient, Consultation, Prescribing, DiagnosisRequest, DiagnosisReport } = require('../../models/mongodb');

// @desc    Register a new patient
// @route   POST /api/patients
const registerPatient = async (req, res, next) => {
  try {
    const { name, age, gender, phone } = req.body;

    const patientExists = await Patient.findOne({ phone });
    if (patientExists) {
      res.status(400);
      throw new Error('Patient with this phone number already exists');
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient medical history
// @route   GET /api/patients/:id/history
const getPatientHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    const history = await Consultation.find({ patient_id: req.params.id })
      .populate('doctor_id')
      .sort({ createdAt: -1 });

    // In MongoDB, we might want to aggregate or just return the history
    // For simplicity, we'll return the patient and their consultations
    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        Consultations: history
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  getPatientHistory
};
