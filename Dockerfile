FROM node:20-alpine
WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source code and build dist
COPY backend/ ./
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
