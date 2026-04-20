# How To Run This Project

This project has:

- Backend: Node/Express on `http://localhost:5001`
- Frontend: React on `http://localhost:3001`
- Database: MySQL

## Before You Start

Make sure these are installed:

- Node.js
- npm
- MySQL

## 1. Create the Database

Open MySQL and create the database:

```sql
CREATE DATABASE placement_cell;
```

Then run the schema and sample data files from the project root:

```bash
mysql -u root -p placement_cell < database/schema.sql
mysql -u root -p placement_cell < database/sample_data.sql
```

## 2. Update Backend Config

Open [backend/.env](/Users/devariwala/development/Placement%20cell/backend/.env) and set your real MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_cell
JWT_SECRET=change_this_secret
PORT=5001
```

## 3. Install Dependencies

From the project root:

```bash
npm install
```

If needed, also install inside backend and frontend:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 4. Start the Project

From the project root:

```bash
npm start
```

That starts:

- Backend on `http://localhost:5001`
- Frontend on `http://localhost:3001`

Open this in your browser:

```text
http://localhost:3001
```

## If Something Fails

## Database connection error

Your MySQL username/password in `backend/.env` is wrong, or MySQL is not running.

## Frontend opens but API fails

The backend is probably not connected to MySQL, or the database tables were not imported.

## Port already in use

This project is configured to use:

- Frontend: `3001`
- Backend: `5001`

If those ports are busy, stop the other app using them or change the ports in:

- [package.json](/Users/devariwala/development/Placement%20cell/package.json)
- [backend/.env](/Users/devariwala/development/Placement%20cell/backend/.env)
- [backend/server.js](/Users/devariwala/development/Placement%20cell/backend/server.js)
- [frontend/src/config/api.js](/Users/devariwala/development/Placement%20cell/frontend/src/config/api.js)

## Default Login Details

These email accounts are present in `database/sample_data.sql`:

- Admin: `admin@college.edu`
- Student: `student1@college.edu`
- Recruiter: `recruiter1@company.com`

Important:

The sample SQL does not contain a real working password hash. The file uses a placeholder bcrypt value:

```text
$2b$10$examplehashedpassword
```

That means there is no confirmed working default password in the current seed data.

The old README says the password is `password`, but the actual seeded hash in the database script does not match `password`.

## Easiest Way To Get A Working Login

After the project is running, register a new user from the UI.

Or replace the password hashes in `database/sample_data.sql` with real bcrypt hashes before importing the sample data.
