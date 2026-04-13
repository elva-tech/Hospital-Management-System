const { Billing, Patient } = require('../models');
const { sendMessage } = require('../services/whatsappService');

// @desc    Create billing invoice
// @route   POST /api/billing/create
// @access  Private (Receptionist, Pharmacist, Admin)
const createBilling = async (req, res) => {
  try {
    const { patientId, consultationId, items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for billing' });
    }

    const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);

    const invoice = await Billing.create({
      patient: patientId,
      consultationId: consultationId || null,
      items,
      totalAmount,
      status: 'pending'
    });

    const patient = await Patient.findById(patientId);
    if (patient) {
      await sendMessage(patient.phone, `Hello ${patient.name}, your total bill is ₹${totalAmount}. Please visit the reception to make the payment.`);
    }

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Pay bill
// @route   POST /api/billing/pay
// @access  Private (Receptionist, Admin)
const payBill = async (req, res) => {
  try {
    const { invoiceId, paymentMode } = req.body;

    const invoice = await Billing.findById(invoiceId).populate('patient');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    invoice.status = 'paid';
    invoice.paymentMode = paymentMode; // 'Cash', 'UPI', 'Card'
    await invoice.save();

    await sendMessage(invoice.patient.phone, `Thank you ${invoice.patient.name}. We have received your payment of ₹${invoice.totalAmount} via ${paymentMode}. Have a great day!`);

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient bills
// @route   GET /api/billing/:patient_id
// @access  Private (Receptionist, Admin)
const getPatientBills = async (req, res) => {
  try {
    const bills = await Billing.find({ patient: req.params.patient_id }).populate('consultationId');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBilling, payBill, getPatientBills };
