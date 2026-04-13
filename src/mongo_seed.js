const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Doctor, Medicine } = require('./models/mongodb');
const connectDB = require('./config/mongodb');

dotenv.config();

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

const seedData = async () => {
  try {
    await connectDB();

    await Doctor.deleteMany();
    await Medicine.deleteMany();

    await Doctor.insertMany(doctors);
    await Medicine.insertMany(medicines);

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
