import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Users
  const users = [
    { name: 'Admin', phone: '9999999991', password: hashedPassword, role: 'ADMIN' },
    { name: 'Dr. Ramesh Gupta', phone: '9999999992', password: hashedPassword, role: 'DOCTOR' },
    { name: 'Receptionist', phone: '9999999993', password: hashedPassword, role: 'RECEPTIONIST' },
    { name: 'Pharmacist', phone: '9999999994', password: hashedPassword, role: 'PHARMACIST' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: u as any,
    });
  }

  // Medicines
  const medicines = [
    { name: 'Paracetamol 500mg', price: 10, stock: 100 },
    { name: 'Iron + Folic acid', price: 50, stock: 50 },
    { name: 'Cetirizine 10mg', price: 15, stock: 80 },
    { name: 'Amoxicillin 500mg', price: 120, stock: 30 },
    { name: 'Omeprazole 20mg', price: 40, stock: 60 },
  ];

  for (const m of medicines) {
    await prisma.medicine.upsert({
      where: { name: m.name },
      update: { price: m.price, stock: m.stock },
      create: m,
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
