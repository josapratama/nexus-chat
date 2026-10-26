# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency files and prisma configuration first for Docker layer caching
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies (runs postinstall prisma generate successfully)
RUN npm ci

# Copy source code
COPY . .

# Ensure public directory exists
RUN mkdir -p public/uploads

# Ensure Prisma client is generated and build Next.js standalone
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create upload directory and grant permissions
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public

# Copy necessary files from standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
