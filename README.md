# Academic Architect — Placement Console

A premium, full-stack Placement Cell Management System designed for modern educational institutions. Built with **React**, **Node.js/Express**, and **MySQL**, featuring a refined **Material Design 3** aesthetic and comprehensive placement workflow management.

![Login Page Mocker](/api/placeholder/1500/800) *(Modern Glassmorphism UI)*

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
- **Frontend**: React (Hooks, Context API), Tailwind CSS, Material Symbols.
- **Backend**: Node.js, Express.
- **Database**: MySQL (Connection Pooling, Prepared Statements).
- **Auth**: JWT (JSON Web Tokens) with Bcrypt password hashing.

---

## 🚦 Getting Started

### 1. Database Setup
Create a MySQL database named `placement_cell` and import the schema:
```bash
mysql -u root -p placement_cell < database/schema.sql
```

### 2. Configure Environment
Update `backend/.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=placement_cell
JWT_SECRET=your_secret_key
PORT=5001
```

### 3. Install & Seed
```bash
# Install root dependencies
npm install

# Setup database tables and seed mock data
npm run db:setup --prefix backend
node backend/scripts/seedMockData.js
```

### 4. Run the Project
```bash
npm start
```
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:5001

---

## 🔑 Sample Credentials
- **Admin**: `admin@college.edu` / `password`
- **Student**: `student1@college.edu` / `password`
- **Recruiter**: `recruiter1@company.com` / `password`

---

Built with ❤️ by the Academic Architect Team.