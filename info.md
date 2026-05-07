# Placement Portal - Technical Information

## 1. Database Population
The database is populated using a multi-step process:
- **Source**: Data is extracted from official university placement records (e.g., `EDPEEE.pdf`).
- **Processing**: A Python script (`backend/database/parse_pdf.py`) parses the PDF content and generates SQL seed files.
- **Loading**: The generated `seed_data.sql` and `seed_extra.sql` files are executed against the Oracle Database. This process is automated via the `deploy_db.sh` script, which handles schema creation and data seeding in one go.
- **Manual Control**: While initial data is bulk-loaded, the admin dashboard allows manual addition/deletion of students and job roles via the backend API.

## 2. PL/SQL Analytics & Logic
The project leverages advanced PL/SQL features to maintain data integrity and provide analytics:
- **Stored Procedures**: Files like `plsql_logic.sql` contain procedures such as `AddApplication`, which performs server-side validation (CGPA and branch eligibility) before allowing an application to be recorded.
- **Triggers**: Automation is handled directly in the DB:
    - `trg_UpdateStudentStatus`: Marks a student as 'Placed' when an application is accepted.
    - `trg_UpdateJobRoleStatus`: Decrements `open_positions` and updates job status to 'Filled' automatically when a candidate is selected.
- **Backend Integration**: The Node.js backend (`server.js`) uses the `oracledb` driver. It currently executes high-performance SQL queries for the analytics dashboard but is architected to invoke stored procedures for complex business logic.

## 3. Database Architecture Highlights
- **Engine**: Oracle Database (Enterprise Grade).
- **Schema**: Relational model with tables for `Users`, `Students`, `Companies`, `JobRoles`, and `Applications`.
- **Performance**: Uses standard indexing and PL/SQL cursors (`ListHighOffers`) for efficient data retrieval.
- **Security**: Password-based authentication with role-based access control (Student vs. Admin).

## 4. Full Tech Stack
### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS with a focus on modern design (Glassmorphism, Dark Mode).
- **Animations**: Framer Motion
- **Visuals**: Recharts (for placement analytics charts) and Lucide React (for iconography).
- **Communication**: Axios for REST API consumption.

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **DB Driver**: `oracledb` (Oracle Database driver for Node.js).
- **Environment**: Managed via `.env` for database credentials and port configuration.

### **Database**
- **Type**: Relational (RDBMS)
- **Engine**: Oracle Database
- **Logic**: PL/SQL (Procedures, Functions, Triggers, Cursors).
