-- DDL for Placement Cell Management System

-- Students Table
CREATE TABLE Students (
    student_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    cgpa NUMBER(4, 2) CHECK (cgpa >= 0 AND cgpa <= 10),
    branch VARCHAR2(50) NOT NULL,
    grad_year NUMBER(4) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    status VARCHAR2(20) DEFAULT 'Unplaced' CHECK (status IN ('Unplaced', 'Placed', 'Interned'))
);

-- Companies Table
CREATE TABLE Companies (
    company_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    industry VARCHAR2(50),
    location VARCHAR2(100)
);

-- JobRoles Table
CREATE TABLE JobRoles (
    role_id NUMBER PRIMARY KEY,
    company_id NUMBER REFERENCES Companies(company_id),
    title VARCHAR2(100) NOT NULL,
    type_of_offer VARCHAR2(50), -- e.g., Intern, FTE, Intern+FTE
    package_ctc NUMBER, -- in LPA
    stipend NUMBER, -- per month
    eligibility_cgpa NUMBER(4, 2),
    branches_allowed VARCHAR2(500), -- Comma separated branch codes
    last_date_to_apply DATE
);

-- Applications Table
CREATE TABLE Applications (
    application_id NUMBER PRIMARY KEY,
    student_id NUMBER REFERENCES Students(student_id),
    role_id NUMBER REFERENCES JobRoles(role_id),
    app_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shortlisted', 'Rejected', 'Selected')),
    CONSTRAINT unique_app UNIQUE(student_id, role_id)
);

-- InterviewRounds Table
CREATE TABLE InterviewRounds (
    round_id NUMBER PRIMARY KEY,
    role_id NUMBER REFERENCES JobRoles(role_id),
    round_number NUMBER NOT NULL,
    round_type VARCHAR2(50) NOT NULL, -- e.g., OA, Technical, HR
    scheduled_date DATE
);

-- RoundResults Table
CREATE TABLE RoundResults (
    result_id NUMBER PRIMARY KEY,
    application_id NUMBER REFERENCES Applications(application_id),
    round_id NUMBER REFERENCES InterviewRounds(round_id),
    score NUMBER,
    result_status VARCHAR2(20) CHECK (result_status IN ('Selected', 'Rejected'))
);

-- Offers Table
CREATE TABLE Offers (
    offer_id NUMBER PRIMARY KEY,
    application_id NUMBER REFERENCES Applications(application_id),
    offer_date DATE DEFAULT SYSDATE,
    package_offered NUMBER,
    acceptance_status VARCHAR2(20) DEFAULT 'Pending' CHECK (acceptance_status IN ('Pending', 'Accepted', 'Rejected'))
);
