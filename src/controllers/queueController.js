const { Queue, Patient } = require('../models');
const { sendMessage } = require('../services/whatsappService');

// @desc    Add patient to queue
// @route   POST /api/queue/add
// @access  Private (Receptionist)
const addToQueue = async (req, res) => {
  try {
    const { phone, doctorId } = req.body;
    const patient = await Patient.findOne({ phone });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Generate token for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await Queue.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const tokenNumber = todayCount + 1;

    const queueEntry = await Queue.create({
      patient: patient._id,
      doctor: doctorId || null,
      tokenNumber,
      status: 'waiting'
    });

    await sendMessage(patient.phone, `Hello ${patient.name}, your token number is ${tokenNumber}. Please wait for your turn.`);

    res.status(201).json(queueEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get queue for today
// @route   GET /api/queue/today
// @access  Private (Receptionist, Doctor)
const getTodayQueue = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const queue = await Queue.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('patient').populate('doctor', 'name');

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update queue status
// @route   PATCH /api/queue/status
// @access  Private (Doctor, Receptionist)
const updateQueueStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // status: 'in consultation', 'completed'
    
    const queueEntry = await Queue.findById(id).populate('patient');
    if (!queueEntry) {
      return res.status(404).json({ message: 'Queue entry not found' });
    }

    queueEntry.status = status;
    await queueEntry.save();

    if (status === 'in consultation') {
      await sendMessage(queueEntry.patient.phone, `Hello ${queueEntry.patient.name}, it's your turn. Please proceed to the consultation room.`);
    }

    res.json(queueEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addToQueue, getTodayQueue, updateQueueStatus };
