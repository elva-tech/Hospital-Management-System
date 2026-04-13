const mongoose = require('mongoose');

const pharmacySaleSchema = mongoose.Schema({
  prescription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  total_price: {
    type: Number,
    required: true
  },
  sold_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PharmacySale', pharmacySaleSchema);
