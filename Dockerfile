# =========================
# Build Stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (npm install works without pre-synced lock file)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js app (STRICT: TypeScript enforced)
ENV NODE_ENV=production
RUN npm run build


# =========================
# Production Runtime Stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start"]
