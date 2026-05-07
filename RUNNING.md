# How To Run This Project

This project is a full-stack application using a modern tech stack:

- **Backend**: Node/Express running on `http://localhost:5001`
- **Frontend**: React (Vite) running on `http://localhost:5173`
- **Database**: Oracle Database 23c (via Docker)

---

## 1. Database Setup (Oracle Docker)

Ensure you have **Docker** installed and running.

### Start the Oracle Container:
```bash
docker run -d --name oracle-db -p 1521:1521 -e ORACLE_PASSWORD=YourPassword123 gvenzl/oracle-free
```

### Initialize Schema and Data:
Run these commands from the project root to copy and execute the SQL scripts:

```bash
# Copy scripts to container
docker cp backend/database/schema.sql oracle-db:/tmp/
docker cp backend/database/plsql_logic.sql oracle-db:/tmp/
docker cp backend/database/seed_data.sql oracle-db:/tmp/
docker cp backend/database/seed_extra.sql oracle-db:/tmp/
docker cp backend/database/update_jobs.sql oracle-db:/tmp/

# Run scripts in order
docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1 @/tmp/schema.sql
docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1 @/tmp/plsql_logic.sql
docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1 @/tmp/seed_data.sql
docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1 @/tmp/seed_extra.sql
docker exec -it oracle-db sqlplus system/YourPassword123@//localhost:1521/FREEPDB1 @/tmp/update_jobs.sql
```

---

## 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Verify `.env` file:
   ```env
   DB_USER=system
   DB_PASSWORD=YourPassword123
   DB_CONNECTION_STRING=localhost:1521/FREEPDB1
   PORT=5001
   ```
4. Start the server:
   ```bash
   node server.js
   ```

---

## 3. Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 4. Portals & Login

Once both are running, open your browser to:
**http://localhost:5173**

### Default Test Credentials:

**Administrator Portal:**
- **Email:** `admin@thapar.edu`
- **Password:** `admin123`

**Student Portal:**
- **Email:** `dev@thapar.edu`
- **Password:** `password123`

---

## Troubleshooting

### "ORA-12541: TNS:no listener"
The Docker container is likely not fully started yet. Wait 30-60 seconds for Oracle to initialize services after the container starts.

### "fatal: could not read Username"
This happens during `git push`. Use your terminal to push manually if you haven't configured a credential helper.

### Port 5173 or 5001 already in use
Check if you have other instances running. Use `lsof -i :5001` to find and kill the process if necessary.
