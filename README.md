# Backend Portfolio — Diogo Silveira Benício

> Full Stack Engineer | Node.js • React • Java • Elasticsearch | Cloud, IoT & Data Platforms

Portfólio técnico com 5 microsserviços interconectados demonstrando arquitetura hexagonal, SOA, segurança com JWT e infraestrutura containerizada.

---

## Stack

### Infraestrutura
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### API Gateway
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Weather API
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch_8-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)

### NPS API
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

---

## Projetos

| Projeto | Stack | Porta |
|---|---|---|
| [nginx](./nginx) | Nginx 1.27 | **:80** (único ponto externo) |
| [gateway-api](./gateway-api) | Node.js 20 + Fastify + JWT | Interno :4000 |
| [weather-api](./weather-api) | Java 21 + Spring Boot 3.3 + Elasticsearch 8 | Interno :8080 |
| [nps-api](./nps-api) | Node.js 20 + Fastify + Prisma + PostgreSQL 15 | Interno :3001 |
| [frontend](./frontend) | Next.js 14 + shadcn/ui + Tailwind | Interno :3000 |

---

## Arquitetura de Segurança

```
Internet
   ↓
Nginx :80  ──── único ponto de entrada ────────────────────
   │
   ├── /          → Next.js Frontend (interno :3000)
   │
   └── /api/*     → API Gateway (interno :4000)
                       │
                       ├── JWT validation (rotas protegidas)
                       ├── Rate limiting (30 req/min)
                       ├── Request logging estruturado
                       │
                       ├── /api/weather/* → Weather API (interno :8080)
                       │                        └── Elasticsearch (interno :9200)
                       └── /api/nps/*    → NPS API (interno :3001)
                                                └── PostgreSQL (interno :5432)
```

**Superfície de ataque:** antes 5 portas expostas → agora **1 porta** (Nginx :80)

---

## Rotas Públicas vs Protegidas (JWT)

| Endpoint | Auth |
|---|---|
| `GET /api/weather/current` | público |
| `GET /api/weather/forecast` | público |
| `GET /api/weather/history` | JWT obrigatório |
| `POST /api/weather/refresh` | JWT obrigatório |
| `POST /api/nps/responses` | público |
| `GET /api/nps/summary` | público |
| `GET /api/nps/responses` | JWT obrigatório |

---

## Arquiteturas por Projeto

**Weather API & NPS API** — Arquitetura Hexagonal (Ports & Adapters):
- `domain/` — entidades e lógica de negócio puros, zero dependência de framework
- `domain/port/in/` — casos de uso (interfaces driving)
- `domain/port/out/` — portas de saída (interfaces driven)
- `adapter/in/` — controllers REST
- `adapter/out/` — repositórios e clientes externos

**Gateway API** — Arquitetura em Camadas SOA:
- `config/` — configuração estática (env, routes, upstreams)
- `services/` — TokenService (JWT), ProxyService (HTTP proxy)
- `middleware/` — authMiddleware (JWT hook), rateLimitPlugin, requestLogger
- `routes/` — authRoutes (`/api/auth/*`), proxyRoutes (`/api/weather/*`, `/api/nps/*`)

---

## Como Executar

### Pré-requisitos
- Docker + Docker Compose
- Chave da [OpenWeather API](https://openweathermap.org/api) (free tier)

### Setup

```bash
cp .env.example .env
# Edite .env: OPENWEATHER_API_KEY, JWT_SECRET (mín. 32 chars), ADMIN_PASS

docker compose up --build -d
```

### Acessos após subir

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost |
| **API Gateway** (via Nginx) | http://localhost/api/* |
| **Health Nginx** | http://localhost/nginx-health |
| **Health Gateway** | http://localhost/api/health |

### Obter token JWT (rotas admin)

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin2025"}'
```

### Usar token

```bash
curl "http://localhost/api/weather/history?city=Uberlândia" \
  -H "Authorization: Bearer <token>"
```

---

**Contato:** diogobenicio@hotmail.com | [LinkedIn](https://linkedin.com/in/diogosbenicio)
