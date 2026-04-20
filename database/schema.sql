-- Placement Cell Management System Database Schema

CREATE DATABASE IF NOT EXISTS placement_cell;
USE placement_cell;

-- Users table (common for all roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'recruiter') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    cgpa DECIMAL(4,2) CHECK (cgpa >= 0 AND cgpa <= 10),
    skills TEXT,
    resume_link VARCHAR(500),
    phone VARCHAR(15),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(15),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    location VARCHAR(255),
    company_id INT NOT NULL,
    posted_by INT NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('open', 'closed') DEFAULT 'open',
    drive_date DATE NULL,
    drive_date_raw VARCHAR(50),
    offer_type VARCHAR(255),
    eligible_branches TEXT,
    eligibility_criteria TEXT,
    source_pdf VARCHAR(255),
    source_serial INT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('applied', 'shortlisted', 'rejected', 'accepted') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    placed_at TIMESTAMP NULL,
    resume_path VARCHAR(500),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (student_id, job_id)
);

-- Raw placement tracker rows imported from EDPEEE.pdf.
-- This preserves the source-table evidence even when a row is also mapped into jobs.
CREATE TABLE IF NOT EXISTS placement_drives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_pdf VARCHAR(255) NOT NULL,
    source_serial INT,
    drive_date DATE NULL,
    drive_date_raw VARCHAR(50),
    company_id INT NULL,
    job_id INT NULL,
    company_name VARCHAR(255),
    offer_type VARCHAR(255),
    eligible_branches TEXT,
    cgpa_criteria TEXT,
    profile VARCHAR(500),
    raw_text TEXT,
    page_stream INT,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_jobs_source_pdf ON jobs(source_pdf);
CREATE INDEX idx_placement_drives_source_pdf ON placement_drives(source_pdf);
CREATE INDEX idx_placement_drives_company_id ON placement_drives(company_id);
CREATE INDEX idx_placement_drives_job_id ON placement_drives(job_id);
