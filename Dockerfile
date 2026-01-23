# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci && npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]

FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci && npx prisma generate

COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]