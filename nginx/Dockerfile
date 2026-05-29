# ─── Stage 1: Build Next.js estático ─────────────────────────
# ─── Stage 1: Build Next.js estático ─────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app

ARG NEXT_PUBLIC_WEATHER_API_URL=/api/weather
ARG NEXT_PUBLIC_NPS_API_URL=/api/nps
ARG NEXT_PUBLIC_OPENWEATHER_API_KEY=
ENV NEXT_PUBLIC_WEATHER_API_URL=$NEXT_PUBLIC_WEATHER_API_URL
ENV NEXT_PUBLIC_NPS_API_URL=$NEXT_PUBLIC_NPS_API_URL
ENV NEXT_PUBLIC_OPENWEATHER_API_KEY=$NEXT_PUBLIC_OPENWEATHER_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
RUN npm install --prefer-offline 2>/dev/null || npm install

COPY frontend/ .
RUN npm run build

# ─── Stage 2: nginx servindo arquivos estáticos ───────────────
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.dev.conf nginx/nginx.prod.conf nginx/security-headers.conf /etc/nginx/

ARG NGINX_CONF=nginx.dev.conf
RUN rm -f /etc/nginx/nginx.conf && \
    ln -s /etc/nginx/${NGINX_CONF} /etc/nginx/nginx.conf

COPY --from=frontend-builder /app/out /var/www/frontend

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
