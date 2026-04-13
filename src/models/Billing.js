const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  consultationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation' // if any consultation applies
  },
  items: [{
    description: String,
    amount: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Card', null],
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
