const mongoose = require('mongoose');

const prescriptionItemSchema = mongoose.Schema({
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  }
});

const prescriptionSchema = mongoose.Schema({
  consultation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  items: [prescriptionItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
