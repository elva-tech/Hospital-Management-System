const { Doctor, Medicine } = require('../models/mongodb');

const seedMongoData = async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount > 0) return; // Already seeded

    const doctors = [
      { name: 'Dr. John Smith', specialization: 'Cardiology' },
      { name: 'Dr. Sarah Connor', specialization: 'Neurology' },
      { name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine' }
    ];

    const medicines = [
      { name: 'Paracetamol', stock: 100, price: 10.5, expiry_date: new Date('2026-12-31') },
      { name: 'Amoxicillin', stock: 50, price: 25.0, expiry_date: new Date('2025-11-30') },
      { name: 'Ibuprofen', stock: 75, price: 15.75, expiry_date: new Date('2026-06-30') }
    ];

    await Doctor.insertMany(doctors);
    await Medicine.insertMany(medicines);

    console.log('MongoDB: Initial Data Seeded Successfully');
  } catch (error) {
    console.error(`MongoDB Seeding Error: ${error.message}`);
  }
};

module.exports = seedMongoData;
