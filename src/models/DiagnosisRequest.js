const mongoose = require('mongoose');

const diagnosisRequestSchema = mongoose.Schema({
  consultation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  test_name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosisRequest', diagnosisRequestSchema);
