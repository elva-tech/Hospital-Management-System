# Clinic HMS - Full-Stack Application

The system has been completely built and containerized.

### How to Run:
1. Open terminal and navigate to `/home/ravella/Videos/hms/clinic_hms`.
2. Run `docker compose up --build`.
3. Open your browser to `http://localhost:5173`.

### Pre-configured Login Accounts (Phone / Password: `password123`):
*   **Receptionist**: `9999999993`
*   **Doctor**: `9999999992`
*   **Pharmacist**: `9999999994`
*   **Admin**: `9999999991`

### Workflow Simulation:
1.  **Login as Receptionist**: Register a patient by entering their phone number and add them to the queue.
2.  **Login as Doctor**: See the patient in the "Waiting Room" section. Call them in, add a diagnosis, add medicines to the prescription (simulates picking from inventory stock), and click Finish.
3.  **Login as Pharmacist**: See the pending prescription, confirm the medicines, and click "Dispense" (reduces stock automatically).
4.  **Login back as Receptionist (Billing)**: Search the patient's phone number, view the generated invoice encompassing doctor fees and medicines, select a payment mode, and mark it as PAID.

*Note: Look at the terminal running the backend/Docker to see the formatted mock WhatsApp messages arriving for the patient at each step.*
