# syntax=docker/dockerfile:1

# 1. Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) for building
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# 2. Dependencies stage (production only)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# 3. Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder and deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 8000

CMD ["node", "dist/main"]
