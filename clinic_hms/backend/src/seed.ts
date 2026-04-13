import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { phone: '9999999991' },
    update: {},
    create: {
      phone: '9999999991',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { phone: '9999999992' },
    update: {},
    create: {
      phone: '9999999992',
      name: 'Dr. Gregory House',
      password: hashedPassword,
      role: 'DOCTOR',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { phone: '9999999993' },
    update: {},
    create: {
      phone: '9999999993',
      name: 'Sarah Connor',
      password: hashedPassword,
      role: 'RECEPTIONIST',
    },
  });

  const pharmacist = await prisma.user.upsert({
    where: { phone: '9999999994' },
    update: {},
    create: {
      phone: '9999999994',
      name: 'Bob Ross',
      password: hashedPassword,
      role: 'PHARMACIST',
    },
  });

  // Medicines
  const paracetamol = await prisma.medicine.upsert({
    where: { name: 'Paracetamol 500mg' },
    update: {},
    create: {
      name: 'Paracetamol 500mg',
      stock: 1000,
      price: 2.5,
    },
  });

  const amoxicillin = await prisma.medicine.upsert({
    where: { name: 'Amoxicillin 250mg' },
    update: {},
    create: {
      name: 'Amoxicillin 250mg',
      stock: 500,
      price: 15.0,
    },
  });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
