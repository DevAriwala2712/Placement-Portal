SET DEFINE OFF;
SET SERVEROUTPUT ON;

-- 1. Add columns to JobRoles
ALTER TABLE JobRoles ADD (
    open_positions NUMBER DEFAULT 1,
    status VARCHAR2(20) DEFAULT 'Open'
);

-- 2. Populate mock package_ctc data (randomly between 5 and 35 LPA)
UPDATE JobRoles
SET package_ctc = ROUND(DBMS_RANDOM.VALUE(5, 35), 1)
WHERE package_ctc = 0 OR package_ctc IS NULL;

-- 3. Update existing job roles that have already been 'Selected'
-- Note: Since Dev Ariwala has some 'Selected' applications, let's mark those jobs as 'Filled'
UPDATE JobRoles
SET open_positions = 0, status = 'Filled'
WHERE role_id IN (
    SELECT role_id FROM Applications WHERE status = 'Selected'
);

COMMIT;

-- 4. Create Trigger to handle future applications
CREATE OR REPLACE TRIGGER trg_UpdateJobRoleStatus
AFTER UPDATE OF status ON Applications
FOR EACH ROW
WHEN (NEW.status = 'Selected')
BEGIN
    UPDATE JobRoles
    SET open_positions = open_positions - 1,
        status = CASE WHEN open_positions - 1 <= 0 THEN 'Filled' ELSE 'Open' END
    WHERE role_id = :NEW.role_id;
END;
/
