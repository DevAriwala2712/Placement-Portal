#!/bin/bash
echo "🚀 Deploying Placement Portal Database to Oracle Docker..."

echo "1. Copying updated SQL files to the Docker container..."
docker cp database/schema.sql oracle-db:/tmp/
docker cp database/plsql_logic.sql oracle-db:/tmp/
docker cp database/seed_data.sql oracle-db:/tmp/

echo "2. Executing scripts in SQL*Plus..."
docker exec -i oracle-db sqlplus -s system/YourPassword123@//localhost:1521/FREEPDB1 <<EOF
SET SERVEROUTPUT ON;
@/tmp/schema.sql
@/tmp/plsql_logic.sql
@/tmp/seed_data.sql
EXIT;
EOF

echo "✅ Database Deployment Complete! You can now start the backend with: node server.js"
