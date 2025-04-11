FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
COPY . .

RUN npm ci && npm run build