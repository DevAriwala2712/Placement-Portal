# Placement Portal - Academic Architect

A premium, full-stack Placement Cell Management System designed for modern educational institutions. Built with **React (Vite)**, **Node.js/Express**, and **MySQL**, featuring a refined **Material Design 3** aesthetic and comprehensive placement workflow management.

<img width="1510" height="824" alt="Screenshot 2026-04-21 at 01 49 17" src="https://github.com/user-attachments/assets/b55553bd-f5ab-4d62-b09b-0e9b6f064266" />
<img width="1512" height="828" alt="Screenshot 2026-04-21 at 01 49 26" src="https://github.com/user-attachments/assets/ce4e46b8-dd08-4f32-9056-d4b35091d828" />


## ✨ Key Features

### 🚀 Placement Workflow Management
- **Placement Board**: A real-time split view of placed vs. unplaced students with advanced filtering.
- **Bulk Assign**: Efficiently assign multiple students to a job drive at once with built-in eligibility filtering.
- **Eligibility Engine**: Automatic matching of students to jobs based on branch and CGPA criteria.
- **Batch Processing**: Shortlist, accept, or reject multiple applicants in seconds.

### 📊 Advanced Analytics
- **Placement Intelligence**: Live dashboard tracking placement rates, branch-wise performance, and salary trends.
- **Salary Analytics**: Visualize average, highest, and lowest packages (LPA).
- **Recruiter Metrics**: Track top companies and hiring conversion rates.

### 🍱 Premium UI/UX
- **Academic Architect Design System**: A high-end look using **Tailwind CSS**, **Glassmorphism**, and **Bento-grid** layouts.
- **Role-Based Dashboards**: Tailored experiences for Admins, Students, and Recruiters.
- **Responsive Shell**: Modern sidebar navigation with Material Symbols and subtle micro-animations.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite, JSX), Tailwind CSS, Material Symbols.
- **Backend**: Node.js, Express.
- **Database**: MySQL (Connection Pooling, Prepared Statements).
- **PL/SQL**: Scripts for advanced database rules, triggers, and procedures.

---

## 🚦 Getting Started (For Development & Sharing)

Follow these steps to get the project running on your local machine. This project consists of two main folders: `frontend` and `backend`.

### 1. Database Setup

1. Make sure you have **MySQL** installed and running on your system.
2. Create a new database named `placement_cell`:
   ```sql
   CREATE DATABASE placement_cell;
   ```
3. Import the provided schema and seed data into the database. You can do this via the MySQL command line or a GUI tool like MySQL Workbench:
   ```bash
   # In your terminal (assuming you are at the project root):
   mysql -u root -p placement_cell < backend/database/schema.sql
   mysql -u root -p placement_cell < backend/database/seed_data.sql
   ```
   *(Optional)* If you want to use advanced PL/SQL features (Triggers, Procedures), you can review and run the contents of `backend/database/plsql_logic.sql` in your SQL client.

### 2. Backend Setup

The backend handles the API and database connections.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   - Copy the `backend/.env.example` file and rename it to `.env`.
   - Update the `.env` file with your actual MySQL credentials (e.g., set your `DB_PASSWORD`).
4. Start the backend server:
   ```bash
   node server.js
   # Or use npm run dev if you have nodemon installed
   ```
   The backend should now be running on `http://localhost:5001`.

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

Since we have seeded the database with mock data, you can use the following credentials to test the portal:

- **Admin Account:**
  - **Email:** `admin@thapar.edu`
  - **Password:** `admin123`

- **Student Account (Example):**
  - **Email:** (Check the `users` table or register a new one)
  - **Password:** `student123`

---

Built with ❤️ by the Academic Architect Team.
