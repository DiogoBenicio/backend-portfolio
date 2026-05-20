# ─── Stage 1: Dependências ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Stage 2: Build ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

# NEXT_PUBLIC_* são inlineadas pelo compilador no bundle; precisam existir aqui,
# não em runtime. Valores padrão funcionam para dev e prod via nginx.
ARG NEXT_PUBLIC_WEATHER_API_URL=/api/weather
ARG NEXT_PUBLIC_NPS_API_URL=/api/nps
ARG NEXT_PUBLIC_OPENWEATHER_API_KEY=
ENV NEXT_PUBLIC_WEATHER_API_URL=$NEXT_PUBLIC_WEATHER_API_URL
ENV NEXT_PUBLIC_NPS_API_URL=$NEXT_PUBLIC_NPS_API_URL
ENV NEXT_PUBLIC_OPENWEATHER_API_KEY=$NEXT_PUBLIC_OPENWEATHER_API_KEY

RUN npm run build

# ─── Stage 3: Runtime ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
