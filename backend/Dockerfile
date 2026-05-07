FROM node:20-slim

# Install Oracle Instant Client dependencies if needed
# The node-oracledb driver often requires them, but the thin driver (v6+) does not.
# We'll use the thin driver (default in latest oracledb)

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
