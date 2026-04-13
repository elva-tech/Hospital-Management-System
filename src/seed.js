const { Doctor, Medicine, sequelize } = require('./models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected for seeding.');

    // Sync database
    await sequelize.sync({ alter: true });

    // Seed Doctors
    const doctors = [
      { name: 'Dr. John Smith', specialization: 'Cardiology' },
      { name: 'Dr. Sarah Connor', specialization: 'Neurology' },
      { name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine' }
    ];

    for (const doc of doctors) {
      await Doctor.findOrCreate({ where: { name: doc.name }, defaults: doc });
    }
    console.log('Doctors seeded.');

    // Seed Medicines
    const medicines = [
      { name: 'Paracetamol', stock: 100, price: 5.50, expiry_date: '2027-12-31' },
      { name: 'Amoxicillin', stock: 50, price: 15.00, expiry_date: '2026-06-30' },
      { name: 'Ibuprofen', stock: 200, price: 8.00, expiry_date: '2027-01-15' }
    ];

    for (const med of medicines) {
      await Medicine.findOrCreate({ where: { name: med.name }, defaults: med });
    }
    console.log('Medicines seeded.');

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
