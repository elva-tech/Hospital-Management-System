const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mock Data
let patients = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', phone: '9876543210', created_at: new Date() }
];
let doctors = [
  { id: 1, name: 'Dr. John Smith', specialization: 'Cardiology' },
  { id: 2, name: 'Dr. Sarah Connor', specialization: 'Neurology' },
  { id: 3, name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine' }
];
let medicines = [
  { id: 1, name: 'Paracetamol', stock: 100, price: 5.50 },
  { id: 2, name: 'Amoxicillin', stock: 50, price: 15.00 },
  { id: 3, name: 'Ibuprofen', stock: 200, price: 8.00 }
];
let consultations = [];
let prescriptions = [];
let prescriptionItems = [];

let diagnosisRequests = [];
let diagnosisReports = [];
let pharmacySales = [];

// Routes
app.get('/', (req, res) => {
  res.send('Hospital Management System API (DEMO MODE) is running...');
});

// Patients
app.post('/api/patients', (req, res) => {
  const { name, age, gender, phone } = req.body;
  if (!name || !age || !gender || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  const newPatient = { id: patients.length + 1, name, age, gender, phone, created_at: new Date() };
  patients.push(newPatient);
  res.status(201).json({ success: true, data: newPatient });
});

app.get('/api/patients/:id/history', (req, res) => {
  const patient = patients.find(p => p.id == req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  
  const history = consultations.filter(c => c.patient_id == patient.id).map(c => {
    const doctor = doctors.find(d => d.id == c.doctor_id);
    const prescs = prescriptions.filter(p => p.consultation_id == c.id).map(p => {
      const items = prescriptionItems.filter(pi => pi.prescription_id == p.id).map(pi => {
        const med = medicines.find(m => m.id == pi.medicine_id);
        return { ...pi, Medicine: { name: med ? med.name : 'Unknown' } };
      });
      return { ...p, PrescriptionItems: items };
    });
    return { ...c, Doctor: doctor, Prescriptions: prescs };
  });

  res.status(200).json({ success: true, data: { ...patient, Consultations: history } });
});

// Consultations
app.post('/api/consultations', (req, res) => {
  const { patient_id, doctor_id, symptoms, diagnosis } = req.body;
  const newConsultation = { 
    id: consultations.length + 1, 
    patient_id, 
    doctor_id, 
    symptoms, 
    diagnosis, 
    created_at: new Date() 
  };
  consultations.push(newConsultation);
  res.status(201).json({ success: true, data: newConsultation });
});

// Prescriptions
app.post('/api/prescriptions', (req, res) => {
  const { consultation_id, items } = req.body;
  const newPrescription = { id: prescriptions.length + 1, consultation_id, created_at: new Date() };
  prescriptions.push(newPrescription);
  
  items.forEach(item => {
    prescriptionItems.push({
      id: prescriptionItems.length + 1,
      prescription_id: newPrescription.id,
      medicine_id: item.medicine_id,
      dosage: item.dosage,
      duration: item.duration
    });
  });

  res.status(201).json({ success: true, data: newPrescription });
});

// Diagnosis
app.post('/api/diagnosis/request', (req, res) => {
  const { consultation_id, test_name } = req.body;
  const newRequest = { id: diagnosisRequests.length + 1, consultation_id, test_name, status: 'Pending', created_at: new Date() };
  diagnosisRequests.push(newRequest);
  res.status(201).json({ success: true, data: newRequest });
});

app.post('/api/diagnosis/report', (req, res) => {
  const { request_id, report_url, result } = req.body;
  const request = diagnosisRequests.find(r => r.id == request_id);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  
  const newReport = { id: diagnosisReports.length + 1, request_id, report_url, result, created_at: new Date() };
  diagnosisReports.push(newReport);
  request.status = 'Completed';
  res.status(201).json({ success: true, data: newReport });
});

app.get('/api/diagnosis/requests', (req, res) => {
  res.status(200).json({ success: true, data: diagnosisRequests });
});

// Pharmacy & Inventory
app.post('/api/pharmacy/token', (req, res) => {
  res.status(200).json({ success: true, token: 'DEMO-TOKEN-123', prescription_id: req.body.prescription_id });
});

app.get('/api/pharmacy/prescriptions/:patient_id', (req, res) => {
  const patientPrescs = prescriptions.filter(p => {
    const consultation = consultations.find(c => c.id == p.consultation_id);
    return consultation && consultation.patient_id == req.params.patient_id;
  });
  res.status(200).json({ success: true, data: patientPrescs });
});

app.post('/api/pharmacy/dispense', (req, res) => {
  const { prescription_id, items } = req.body;
  items.forEach(item => {
    const med = medicines.find(m => m.id == item.medicine_id);
    if (med) med.stock -= item.quantity;
    pharmacySales.push({ id: pharmacySales.length + 1, prescription_id, ...item, sold_at: new Date() });
  });
  res.status(201).json({ success: true, message: 'Medicine dispensed' });
});

app.post('/api/inventory/inward', (req, res) => {
  const { medicine_id, quantity } = req.body;
  const med = medicines.find(m => m.id == medicine_id);
  if (med) med.stock += quantity;
  res.status(200).json({ success: true, data: med });
});

app.get('/api/inventory', (req, res) => {
  res.status(200).json({ success: true, data: medicines });
});

// Notifications
app.post('/api/notifications/send', (req, res) => {
  res.status(200).json({ success: true, message: 'Notification sent (Mocked)' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Demo Server running on port ${PORT}`);
  console.log('NOTE: This is a memory-only demo server for testing purposes.');
});
