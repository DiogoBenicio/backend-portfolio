# ─── Stage 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S -G appgroup -h /app -s /sbin/nologin appuser

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY prisma ./prisma

# Recria o symlink do CLI prisma (devDep não instalada pelo npm ci --omit=dev)
RUN ln -sf ../prisma/build/index.js ./node_modules/.bin/prisma

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main.js"]
