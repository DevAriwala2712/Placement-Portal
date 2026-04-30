-- Sample Data extracted from Placement Tracker 2025-26

-- Insert Companies
INSERT INTO Companies (company_id, name, industry, location) VALUES (1, 'Rubrik', 'Technology', 'Bangalore');
INSERT INTO Companies (company_id, name, industry, location) VALUES (2, 'Uber', 'Technology', 'Bangalore');
INSERT INTO Companies (company_id, name, industry, location) VALUES (3, 'Atlassian', 'Software', 'Remote');
INSERT INTO Companies (company_id, name, industry, location) VALUES (4, 'Meesho', 'E-commerce', 'Bangalore');
INSERT INTO Companies (company_id, name, industry, location) VALUES (5, 'Zomato', 'Food Tech', 'Gurugram');
INSERT INTO Companies (company_id, name, industry, location) VALUES (6, 'Salesforce', 'CRM', 'Hyderabad');

-- Insert Job Roles
INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (1, 1, 'Software Engineer', 'Intern+Performance', 123, 8.00, 'COE,ENC,COPC,ECE,EIC,EEC,ELE');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (2, 2, 'Software Engineering Intern', 'Intern+Performance', 35, 7.00, 'EEC,ELE,ECE,ENC,COBS,COE,COPC');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (3, 4, 'SDE - I', 'Intern+FTE', 25, 0.00, 'COE,COPC,ENC,ECE,COBS,EIC,EEC,ELE');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (4, 5, 'Software Development Engineer (SDE)', 'Intern+Performance', 30, 7.50, 'COE,COPC,COBS,CHE,CIE,ELE,EIC,ECE,ENC,EEC,MEC,MEE');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (5, 6, 'Software Engineer', 'FTE', 35, 7.50, 'COPC,COE,COBS,ENC,EEC');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (6, 2, 'SDE Intern', 'Intern+Performance', 40, 8.00, 'COPC,COE,COBS');

INSERT INTO JobRoles (role_id, company_id, title, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) 
VALUES (7, 5, 'Analyst', 'FTE', 15, 6.50, 'B.E. All Branches');

-- Insert Students
INSERT INTO Students (student_id, name, cgpa, branch, grad_year, email) VALUES (101, 'Harmanjot Singh', 9.2, 'COPC', 2026, 'harmanjot@thapar.edu');
INSERT INTO Students (student_id, name, cgpa, branch, grad_year, email) VALUES (102, 'Dev Ariwala', 8.5, 'COE', 2026, 'dev@thapar.edu');
INSERT INTO Students (student_id, name, cgpa, branch, grad_year, email) VALUES (103, 'Rahul Sharma', 7.2, 'MEE', 2026, 'rahul@thapar.edu');

-- Insert Sample Applications
INSERT INTO Applications (application_id, student_id, role_id, app_date, status) VALUES (1, 101, 1, SYSDATE, 'Shortlisted');
INSERT INTO Applications (application_id, student_id, role_id, app_date, status) VALUES (2, 102, 1, SYSDATE, 'Pending');

-- Insert Sample Interview Rounds
INSERT INTO InterviewRounds (round_id, role_id, round_number, round_type) VALUES (1, 1, 1, 'Online Assessment');
INSERT INTO InterviewRounds (round_id, role_id, round_number, round_type) VALUES (2, 1, 2, 'Technical Interview');

-- Insert Sample Offers
INSERT INTO Offers (offer_id, application_id, offer_date, package_offered, acceptance_status) VALUES (1, 1, SYSDATE, 123, 'Accepted');

COMMIT;
