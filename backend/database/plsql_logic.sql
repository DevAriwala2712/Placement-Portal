-- PL/SQL Logic for Placement Cell Management System

SET SERVEROUTPUT ON;

-- 1. PROCEDURE: Add new student application with eligibility check
CREATE OR REPLACE PROCEDURE AddApplication (
    p_student_id IN NUMBER,
    p_role_id IN NUMBER
) AS
    v_cgpa NUMBER;
    v_min_cgpa NUMBER;
    v_student_branch VARCHAR2(50);
    v_allowed_branches VARCHAR2(500);
BEGIN
    -- Fetch student details
    SELECT cgpa, branch INTO v_cgpa, v_student_branch FROM Students WHERE student_id = p_student_id;
    
    -- Fetch role requirements
    SELECT eligibility_cgpa, branches_allowed INTO v_min_cgpa, v_allowed_branches FROM JobRoles WHERE role_id = p_role_id;
    
    -- Eligibility Check
    IF v_cgpa < v_min_cgpa THEN
        RAISE_APPLICATION_ERROR(-20001, 'Student does not meet minimum CGPA requirement.');
    END IF;
    
    IF INSTR(v_allowed_branches, v_student_branch) = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Student branch is not allowed for this role.');
    END IF;
    
    -- Insert Application
    INSERT INTO Applications (application_id, student_id, role_id, app_date, status)
    VALUES (app_seq.NEXTVAL, p_student_id, p_role_id, SYSDATE, 'Pending');
    
    DBMS_OUTPUT.PUT_LINE('Application submitted successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        RAISE;
END;
/

-- 2. FUNCTION: Get average package for a specific branch
CREATE OR REPLACE FUNCTION GetBranchAvgPackage (
    p_branch IN VARCHAR2
) RETURN NUMBER IS
    v_avg NUMBER;
BEGIN
    SELECT AVG(package_offered) INTO v_avg
    FROM Offers O
    JOIN Applications A ON O.application_id = A.application_id
    JOIN Students S ON A.student_id = S.student_id
    WHERE S.branch = p_branch AND O.acceptance_status = 'Accepted';
    
    RETURN NVL(v_avg, 0);
END;
/

-- 3. CURSOR: List all students with offers above a threshold
CREATE OR REPLACE PROCEDURE ListHighOffers (
    p_min_package IN NUMBER
) AS
    CURSOR c_high_offers IS
        SELECT S.name, C.name AS company_name, O.package_offered
        FROM Students S
        JOIN Applications A ON S.student_id = A.student_id
        JOIN Offers O ON A.application_id = O.application_id
        JOIN JobRoles J ON A.role_id = J.role_id
        JOIN Companies C ON J.company_id = C.company_id
        WHERE O.package_offered >= p_min_package;
        
    v_student_name VARCHAR2(100);
    v_comp_name VARCHAR2(100);
    v_package NUMBER;
BEGIN
    OPEN c_high_offers;
    LOOP
        FETCH c_high_offers INTO v_student_name, v_comp_name, v_package;
        EXIT WHEN c_high_offers%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE('Student: ' || v_student_name || ' | Company: ' || v_comp_name || ' | Package: ' || v_package || ' LPA');
    END LOOP;
    CLOSE c_high_offers;
END;
/

-- 4. TRIGGER: Update student status to 'Placed' automatically when offer is accepted
CREATE OR REPLACE TRIGGER trg_UpdateStudentStatus
AFTER UPDATE OF acceptance_status ON Offers
FOR EACH ROW
WHEN (NEW.acceptance_status = 'Accepted')
BEGIN
    UPDATE Students
    SET status = 'Placed'
    WHERE student_id = (SELECT student_id FROM Applications WHERE application_id = :NEW.application_id);
END;
/

-- 5. TRIGGER: Prevent duplicate applications (already enforced by unique constraint, but can add logging/custom logic)
CREATE OR REPLACE TRIGGER trg_CheckDuplicateApp
BEFORE INSERT ON Applications
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM Applications
    WHERE student_id = :NEW.student_id AND role_id = :NEW.role_id;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Application already exists for this student and role.');
    END IF;
END;
/
