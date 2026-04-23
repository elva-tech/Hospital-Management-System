const { Prescription, Medicine, PharmacySale } = require('../models');
const mongoose = require('mongoose');
// @desc    Generate pharmacy token (True Tokenization)
const generateToken = async (req, res, next) => {
  try {
    const { prescription_id } = req.body;
    
    // Generate secure token
    const crypto = require('crypto');
    const token = `TKN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    
    // Save to Prescription
    const prescription = await Prescription.findById(prescription_id);
    if (!prescription) {
        res.status(404);
        throw new Error('Prescription not found');
    }
    prescription.pharmacy_token = token;
    await prescription.save();
    
    res.status(200).json({
      success: true,
      token,
      prescription_id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions for a patient
const getPatientPrescriptions = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const prescriptions = await Prescription.find()
      .populate({
        path: 'consultation_id',
        match: { patient_id: patient_id }
      })
      .populate('items.medicine_id');

    // Filter out prescriptions where consultation didn't match patient
    const filtered = prescriptions.filter(p => p.consultation_id != null);

    res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispense medicine (Issue Medicine)
const dispenseMedicine = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { prescription_id, items } = req.body;

    const saleRecords = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine_id).session(session);
      if (!medicine) throw new Error(`Medicine ${item.medicine_id} not found`);
      if (medicine.stock < item.quantity) throw new Error(`Not enough stock for ${medicine.name}`);

      medicine.stock -= item.quantity;
      await medicine.save();

      const sale = await PharmacySale.create([{
        prescription_id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        total_price: medicine.price * item.quantity
      }], { session });

      saleRecords.push(sale[0]);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: saleRecords
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Add inventory (Inward)
const addInventory = async (req, res, next) => {
  try {
    const { medicine_id, quantity } = req.body;
    const medicine = await Medicine.findById(medicine_id);
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    medicine.stock += quantity;
    await medicine.save();

    res.status(200).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory status
const getInventoryStatus = async (req, res, next) => {
  try {
    const inventory = await Medicine.find();
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification
const sendNotification = async (req, res, next) => {
  try {
    const { user_id, message, type } = req.body;
    
    const { sendMessage } = require('../services/whatsappService');
    const { generateReceiptPDF } = require('../services/pdfService');
    
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateReceiptPDF({ user_id, message, type });
    } catch (pdfErr) {
        console.error('Failed to generate PDF, falling back to text only', pdfErr);
    }
    
    const result = await sendMessage(user_id, message, pdfBuffer);
    
    res.status(200).json({
      success: true,
      message: 'Notification processed with PDF',
      deliveredLocally: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  getPatientPrescriptions,
  dispenseMedicine,
  addInventory,
  getInventoryStatus,
  sendNotification
};
