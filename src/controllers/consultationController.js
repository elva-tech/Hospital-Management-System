const { Consultation, Patient, Doctor } = require('../../models/mongodb');

// @desc    Create a new consultation
// @route   POST /api/consultations
const createConsultation = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, symptoms, diagnosis } = req.body;

    const patient = await Patient.findById(patient_id);
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }

    const consultation = await Consultation.create({
      patient_id,
      doctor_id,
      symptoms,
      diagnosis
    });

    res.status(201).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConsultation
};
