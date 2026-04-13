const mongoose = require('mongoose');

const diagnosisReportSchema = mongoose.Schema({
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosisRequest',
    required: true
  },
  report_url: {
    type: String,
    required: true
  },
  result: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosisReport', diagnosisReportSchema);
