const { Doctor, Medicine, User } = require('../models');

const seedMongoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const users = [
        { name: 'Dr. Smith', phone: '1000', password: 'doc', role: 'Doctor' },
        { name: 'Pharm. Jane', phone: '2000', password: 'pharm', role: 'Pharmacist' },
        { name: 'Lab Tech. Bob', phone: '3000', password: 'lab', role: 'LabTech' },
        { name: 'Super Admin', phone: '0000', password: 'admin', role: 'Admin' }
      ];
      for (const u of users) {
          await User.create(u);
      }
      console.log('Seeded Role-Based User Accounts (Doctor: 1000/doc, Pharmacy: 2000/pharm, LabTech: 3000/lab)');
    }

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
