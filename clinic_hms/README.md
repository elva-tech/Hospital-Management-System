# Clinic HMS - Hospital Management System

A production-ready, full-stack Hospital Management System (HMS) designed for small to medium-sized clinics. This system streamlines clinic operations by managing patient records, doctor consultations, pharmacy inventory, and billing, all integrated with automated WhatsApp notifications.

## 🚀 Key Features

### 👥 User Roles & Access Control
- **Receptionist**: Patient registration, queue management, and final billing.
- **Doctor**: Digital consultations, diagnosis entry, and electronic prescriptions.
- **Pharmacist**: Prescription fulfillment and automated inventory management.
- **Admin**: Comprehensive system overview and user management.

### 🏥 Core Modules
- **Queue Management**: Real-time patient queuing system to optimize waiting times.
- **Consultation Suite**: Doctors can view patient history, record symptoms, and prescribe medicines.
- **Smart Pharmacy**: Automated stock reduction upon dispensing, with low-stock alerts.
- **Billing System**: Encompasses doctor fees and medicine costs, supporting CASH and UPI payments.
- **WhatsApp Integration**: Automated alerts for registration, consultation completion, and payment confirmations.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Icons**: Lucide React
- **Routing**: React Router DOM 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Automation**: whatsapp-web.js (for real-time notifications)
- **Auth**: JWT (JSON Web Tokens)

### Infrastructure
- **Containerization**: Docker & Docker Compose

## ⚡ Quick Start (Docker)

The system is fully containerized for easy deployment.

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd clinic_hms
   ```

2. **Launch with Docker Compose**:
   ```bash
   docker compose up --build
   ```

3. **Access the Application**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)

## 🧪 Testing Accounts

Use the following credentials to explore the different roles (Password: `password123` for all):

| Role | Phone Number |
| :--- | :--- |
| **Admin** | `9999999991` |
| **Doctor** | `9999999992` |
| **Receptionist** | `9999999993` |
| **Pharmacist** | `9999999994` |

## 🔄 Workflow Simulation

1. **Receptionist**: Register a patient by entering their phone number and add them to the queue.
2. **Doctor**: View the patient in the "Waiting Room", perform the consultation, add diagnosis/medicines, and finish.
3. **Pharmacist**: Dispense the pending prescription (this automatically adjusts the inventory).
4. **Receptionist (Billing)**: Search for the patient, view the final invoice, and mark it as PAID.

*Note: Check the backend/Docker logs to see the formatted mock WhatsApp messages sent at each stage.*

## 📂 Project Structure

```text
clinic_hms/
├── backend/            # Express.js & Prisma API
│   ├── prisma/         # Database schema
│   └── src/            # API logic and routes
├── frontend/           # React 19 & Tailwind CSS app
│   └── src/            # UI components and stores
└── docker-compose.yml  # Orchestration for app and DB
```
