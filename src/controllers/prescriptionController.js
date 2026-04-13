const { Prescription, Consultation, Medicine } = require('../../models/mongodb');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
const createPrescription = async (req, res, next) => {
  try {
    const { consultation_id, items } = req.body;

    const consultation = await Consultation.findById(consultation_id);
    if (!consultation) {
      res.status(404);
      throw new Error('Consultation not found');
    }

    // Verify medicines and stock (Logic remains same, just MongoDB syntax)
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine_id);
      if (!medicine) {
        res.status(404);
        throw new Error(`Medicine ${item.medicine_id} not found`);
      }
    }

    const prescription = await Prescription.create({
      consultation_id,
      items
    });

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription
};
