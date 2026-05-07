# Placement Portal - Academic Architect

A premium, full-stack Placement Cell Management System designed for modern educational institutions. Built with **React (Vite)**, **Node.js/Express**, and **Oracle Database**, featuring a refined **Material Design 3** aesthetic and comprehensive placement workflow management.

<img width="1510" height="824" alt="Screenshot 2026-04-21 at 01 49 17" src="https://github.com/user-attachments/assets/b55553bd-f5ab-4d62-b09b-0e9b6f064266" />
<img width="1512" height="828" alt="Screenshot 2026-04-21 at 01 49 26" src="https://github.com/user-attachments/assets/ce4e46b8-dd08-4f32-9056-d4b35091d828" />

Deployed Link Demo https://placement-portal-jet.vercel.app/login (partial deployment for UI)
## ✨ Key Features

### 🚀 Placement Workflow Management
- **Placement Board**: A real-time split view of placed vs. unplaced students with advanced filtering.
- **Application Tracking**: Admins can shortlist, accept, or reject student applications with live status updates.
- **Eligibility Engine**: Automatic matching of students to jobs based on branch and CGPA criteria.
- **Job Capacity Management**: Automatically tracks open positions and marks roles as "Filled" using PL/SQL triggers.

### 📊 Advanced Analytics
- **Placement Intelligence**: Live dashboard tracking placement rates, branch-wise performance, and salary trends.
- **Salary Analytics**: Visualize average, highest, and lowest packages (LPA).
- **Recruiter Metrics**: Track top companies and hiring conversion rates.

### 🍱 Premium UI/UX
- **Console Design System**: A high-end look using **Vanilla CSS**, **Glassmorphism**, and **Bento-grid** layouts.
- **Role-Based Dashboards**: Tailored experiences for Admins and Students.
- **Responsive Shell**: Modern navigation with Material Symbols and smooth transitions.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite, JSX), Vanilla CSS, Material Symbols.
- **Backend**: Node.js, Express (`oracledb`).
- **Database**: Oracle Database 23c Free (Docker).
- **PL/SQL**: Advanced database rules, triggers, and procedures running natively in Oracle.

---

## 🚦 Getting Started (For Development & Sharing)

Follow these steps to get the project running on your local machine. This project consists of two main folders: `frontend` and `backend`.

### 1. Database Setup (Oracle via Docker)

This project requires Oracle Database to execute the PL/SQL engine commands.

1. Ensure you have **Docker** installed.
2. Spin up an Oracle Free container (supports ARM64 Macs):
   ```bash
   docker run -d --name oracle-db -p 1521:1521 -e ORACLE_PASSWORD=YourPassword123 gvenzl/oracle-free
   ```
3. Copy the database scripts into the container:
   ```bash
   docker cp backend/database/schema.sql oracle-db:/tmp/
   docker cp backend/database/plsql_logic.sql oracle-db:/tmp/
   docker cp backend/database/seed_data.sql oracle-db:/tmp/
   ```
4. Enter the SQL Plus CLI:
   ```bash
   docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1
   ```
5. Run the scripts in order:
   ```sql
   @/tmp/schema.sql
   @/tmp/plsql_logic.sql
   @/tmp/seed_data.sql
   ```

*(Optional GUI):* In Antigravity / VS Code, go to Extensions, install **"Oracle Developer Tools for VS Code"**, and connect using `localhost:1521`, Service Name `FREEPDB1`, User `system`, Password `YourPassword123`.

### 2. Backend Setup

The backend handles the API and talks to the Oracle database.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies (this installs `oracledb`):
   ```bash
   npm install
   ```
3. Set up the environment variables. Ensure your `.env` contains:
   ```env
   DB_USER=system
   DB_PASSWORD=YourPassword123
   DB_CONNECTION_STRING=localhost:1521/FREEPDB1
   PORT=5001
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   The backend should now be running on `http://localhost:5001` and connected to Oracle.

### 3. Frontend Setup

The frontend provides the user interface for students, recruiters, and admins.

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend should now be accessible at `http://localhost:5173` (or the port specified in your terminal).

---

## 🔑 Sample Credentials

### Default Test Credentials

**Administrator Portal:**
- **Email:** `admin@thapar.edu`
- **Password:** `admin123`

**Student Portal:**
- **Email:** `dev@thapar.edu`
- **Password:** `password123`

## Contributing

---

Built with ❤️ by the Academic Architect Team.
