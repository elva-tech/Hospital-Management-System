const mongoose = require('mongoose');
const { Patient, Doctor, Medicine, Consultation, Prescription, DiagnosisRequest, DiagnosisReport, PharmacySale } = require('./models/mongodb');

// Specify the URI you saw in the terminal earlier
const mongoUri = process.argv[2];

if (!mongoUri) {
  console.error('Please provide the MongoDB URI as an argument.');
  console.error('Example: node src/mongo_viewer.js mongodb://127.0.0.1:45345/');
  process.exit(1);
}

const showData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('\n--- LIVE MONGODB DATA ---\n');

    const collections = [
      { name: 'Patients', model: Patient },
      { name: 'Doctors', model: Doctor },
      { name: 'Medicines', model: Medicine },
      { name: 'Consultations', model: Consultation },
      { name: 'Prescriptions', model: Prescription },
      { name: 'Diagnosis Requests', model: DiagnosisRequest },
      { name: 'Diagnosis Reports', model: DiagnosisReport },
      { name: 'Pharmacy Sales', model: PharmacySale }
    ];

    for (const col of collections) {
      const docs = await col.model.find();
      console.log(`\n========= ${col.name} (${docs.length} records) =========`);
      if (docs.length === 0) {
        console.log(' (Empty)');
      } else {
        console.dir(docs.map(d => d.toObject()), { depth: null, colors: true });
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

showData();
