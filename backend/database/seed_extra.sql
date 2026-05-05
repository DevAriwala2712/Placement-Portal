SET DEFINE OFF;
-- Extra students and applications seeder

-- Users
INSERT INTO Users (email, password, role) VALUES ('anika.sharma@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('rohan.mehta@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('priya.verma@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('arjun.nair@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('simran.kaur@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('karan.gupta@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('vikas.yadav@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('tanvi.patel@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('ishaan.roy@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('mehak.singh@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('sahil.kumar@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('divya.malhotra@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('ankit.bhatia@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('pooja.reddy@thapar.edu', 'password123', 'student');
INSERT INTO Users (email, password, role) VALUES ('nikhil.arora@thapar.edu', 'password123', 'student');

-- Students (user_id from auto-increment, we use subquery to get user_id)
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='anika.sharma@thapar.edu'), 'Anika Sharma', 'COE', 9.1, 2026, 'anika.sharma@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='rohan.mehta@thapar.edu'), 'Rohan Mehta', 'COPC', 8.7, 2026, 'rohan.mehta@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='priya.verma@thapar.edu'), 'Priya Verma', 'ECE', 8.3, 2026, 'priya.verma@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='arjun.nair@thapar.edu'), 'Arjun Nair', 'ENC', 7.9, 2026, 'arjun.nair@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='simran.kaur@thapar.edu'), 'Simran Kaur', 'COBS', 8.5, 2026, 'simran.kaur@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='karan.gupta@thapar.edu'), 'Karan Gupta', 'MEE', 7.4, 2026, 'karan.gupta@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='vikas.yadav@thapar.edu'), 'Vikas Yadav', 'COE', 9.3, 2026, 'vikas.yadav@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='tanvi.patel@thapar.edu'), 'Tanvi Patel', 'COPC', 8.8, 2026, 'tanvi.patel@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='ishaan.roy@thapar.edu'), 'Ishaan Roy', 'ECE', 7.6, 2026, 'ishaan.roy@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='mehak.singh@thapar.edu'), 'Mehak Singh', 'CHE', 8.0, 2026, 'mehak.singh@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='sahil.kumar@thapar.edu'), 'Sahil Kumar', 'COE', 8.9, 2026, 'sahil.kumar@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='divya.malhotra@thapar.edu'), 'Divya Malhotra', 'COPC', 9.0, 2026, 'divya.malhotra@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='ankit.bhatia@thapar.edu'), 'Ankit Bhatia', 'ENC', 7.7, 2026, 'ankit.bhatia@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='pooja.reddy@thapar.edu'), 'Pooja Reddy', 'COBS', 8.2, 2026, 'pooja.reddy@thapar.edu');
INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES ((SELECT user_id FROM Users WHERE email='nikhil.arora@thapar.edu'), 'Nikhil Arora', 'COE', 8.6, 2026, 'nikhil.arora@thapar.edu');

-- Applications for Dev Ariwala (student_id=2) — 25 applications with mixed statuses
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 1,   'Selected',     SYSDATE - 60);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 2,   'Rejected',     SYSDATE - 55);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 4,   'Selected',     SYSDATE - 50);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 6,   'Interviewing', SYSDATE - 45);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 7,   'Pending',      SYSDATE - 40);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 10,  'Rejected',     SYSDATE - 38);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 12,  'Interviewing', SYSDATE - 35);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 15,  'Pending',      SYSDATE - 30);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 20,  'Selected',     SYSDATE - 28);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 25,  'Pending',      SYSDATE - 25);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 30,  'Rejected',     SYSDATE - 22);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 35,  'Interviewing', SYSDATE - 20);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 40,  'Pending',      SYSDATE - 18);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 45,  'Pending',      SYSDATE - 16);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 50,  'Rejected',     SYSDATE - 14);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 55,  'Pending',      SYSDATE - 12);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 60,  'Selected',     SYSDATE - 10);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 65,  'Interviewing', SYSDATE - 8);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 70,  'Pending',      SYSDATE - 6);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 75,  'Pending',      SYSDATE - 5);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 80,  'Rejected',     SYSDATE - 4);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 85,  'Pending',      SYSDATE - 3);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 90,  'Interviewing', SYSDATE - 2);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 95,  'Pending',      SYSDATE - 1);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (2, 100, 'Pending',      SYSDATE);

-- Applications for other students (spread across different roles)
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (1, 5,   'Selected',     SYSDATE - 45);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (1, 8,   'Rejected',     SYSDATE - 40);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (3, 3,   'Interviewing', SYSDATE - 30);
INSERT INTO Applications (student_id, role_id, status, app_date) VALUES (3, 11,  'Pending',      SYSDATE - 15);

COMMIT;
