# Placement Cell Management System

A full-stack web application for managing college placements with role-based access for admins, students, and recruiters.

## Features

- **User Roles**: Admin, Student, Recruiter
- **Authentication**: JWT-based secure login
- **Admin Portal**: Dashboard with stats, CRUD operations for students, companies, jobs
- **Student Portal**: View jobs, apply, track applications
- **Recruiter Portal**: Manage companies and jobs, view applicants
- **Database**: MySQL with normalized schema
- **Frontend**: React with Tailwind CSS

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: React.js, Tailwind CSS
- **Authentication**: JWT, bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MySQL Server
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MySQL database:
   - Create a database named `placement_cell`
   - Run the schema script:
     ```bash
     mysql -u root -p placement_cell < ../database/schema.sql
     ```
   - Run the sample data script:
     ```bash
     mysql -u root -p placement_cell < ../database/sample_data.sql
     ```

4. Configure environment variables:
   - Update `.env` file with your MySQL credentials

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```
   App will run on http://localhost:3000

### Default Credentials

- **Admin**: admin@college.edu / password
- **Student**: student1@college.edu / password
- **Recruiter**: recruiter1@company.com / password

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students (Admin only)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (Recruiter)
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (Recruiter)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply for job (Student)
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/job/:jobId` - Get applications for job (Recruiter/Admin)
- `PUT /api/applications/:id/status` - Update application status

### Dashboard
- `GET /api/dashboard/stats` - Get admin stats

## Database Schema

The MySQL database consists of the following tables:
- `users` - User accounts
- `students` - Student profiles
- `companies` - Company information
- `jobs` - Job postings
- `applications` - Job applications

All tables are normalized to 3NF with proper foreign keys and constraints.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.