-- Sample Data for Placement Cell Management System

USE placement_cell;

-- Insert admin user
INSERT INTO users (email, password, role) VALUES ('admin@college.edu', '$2b$10$examplehashedpassword', 'admin');

-- Insert recruiter users
INSERT INTO users (email, password, role) VALUES ('recruiter1@company.com', '$2b$10$examplehashedpassword', 'recruiter');
INSERT INTO users (email, password, role) VALUES ('recruiter2@company.com', '$2b$10$examplehashedpassword', 'recruiter');

-- Insert student users and profiles
INSERT INTO users (email, password, role) VALUES ('student1@college.edu', '$2b$10$examplehashedpassword', 'student');
INSERT INTO students (user_id, name, branch, cgpa, skills, phone, address) VALUES (LAST_INSERT_ID(), 'John Doe', 'Computer Science', 8.5, 'Java, Python', '1234567890', 'Address 1');

INSERT INTO users (email, password, role) VALUES ('student2@college.edu', '$2b$10$examplehashedpassword', 'student');
INSERT INTO students (user_id, name, branch, cgpa, skills, phone, address) VALUES (LAST_INSERT_ID(), 'Jane Smith', 'Information Technology', 9.0, 'JavaScript, React', '0987654321', 'Address 2');

-- Insert companies
INSERT INTO companies (name, description, website, contact_email, contact_phone, created_by) VALUES ('Tech Corp', 'Leading tech company', 'https://techcorp.com', 'hr@techcorp.com', '1111111111', 2);
INSERT INTO companies (name, description, website, contact_email, contact_phone, created_by) VALUES ('Innovate Ltd', 'Innovation driven', 'https://innovate.com', 'jobs@innovate.com', '2222222222', 3);

-- Insert jobs
INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, company_id, posted_by) VALUES ('Software Engineer', 'Develop software', 'BTech in CS, 2 years exp', 50000, 80000, 'Bangalore', 1, 2);
INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, company_id, posted_by) VALUES ('Data Analyst', 'Analyze data', 'BTech, Statistics knowledge', 40000, 60000, 'Mumbai', 2, 3);

-- Insert applications
INSERT INTO applications (student_id, job_id, status) VALUES (1, 1, 'applied');
INSERT INTO applications (student_id, job_id, status) VALUES (2, 2, 'shortlisted');