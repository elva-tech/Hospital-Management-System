import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import queueRoutes from './routes/queueRoutes';
import doctorRoutes from './routes/doctorRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import billingRoutes from './routes/billingRoutes';
import diagnosisRoutes from './routes/diagnosisRoutes';
import './services/whatsappService'; // Initialize automated WA client

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/diagnosis', diagnosisRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Clinic HMS API is running...');
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL (Prisma) Connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

startServer();

export { app, prisma };
