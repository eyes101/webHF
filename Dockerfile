FROM node:20-alpine AS builder

WORKDIR /app

# 1. Install & Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend ./frontend
RUN cd frontend && npm run build

# 2. Install Functions / Root Dependencies
COPY package*.json ./
COPY functions/package*.json ./functions/
RUN npm install
RUN cd functions && npm install

COPY functions ./functions
COPY server.mjs ./

# 3. Environment & Port Configuration
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# 4. Start Server
CMD ["node", "server.mjs"]
