# Backend Portfolio — Diogo Silveira Benício

> Full Stack Engineer | Node.js • React • Java • ElasticSearch | Cloud, IoT & Data Platforms

Portfólio técnico com 5 projetos interconectados demonstrando arquitetura hexagonal, SOA, segurança com JWT e infraestrutura containerizada.

## Projetos

| Projeto | Stack | Acesso |
|---|---|---|
| [nginx](./nginx) | Nginx 1.27 | Porta 80 (único ponto externo) |
| [gateway-api](./gateway-api) | Node.js 20 + Fastify + JWT | Interno :4000 |
| [weather-api](./weather-api) | Java 21 + Spring Boot 3.3 + Elasticsearch 8 | Interno :8080 |
| [nps-api](./nps-api) | Node.js 20 + TypeScript + Fastify 4 + PostgreSQL 15 | Interno :3001 |
| [frontend](./frontend) | Next.js 14 + shadcn/ui + Tailwind | Interno :3000 |

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

## Rotas Públicas vs Protegidas (JWT)

| Endpoint | JWT? |
|---|---|
| `GET /api/weather/current` | ✗ público |
| `GET /api/weather/forecast` | ✗ público |
| `GET /api/weather/history` | ✓ JWT obrigatório |
| `POST /api/weather/refresh` | ✓ JWT obrigatório |
| `POST /api/nps/responses` | ✗ público |
| `GET /api/nps/summary` | ✗ público |
| `GET /api/nps/responses` | ✓ JWT obrigatório |

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
- `routes/` — authRoutes (/api/auth/*), proxyRoutes (/api/weather/*, /api/nps/*)

## Como Executar

### Pré-requisitos
- Docker + Docker Compose
- Chave da [OpenWeather API](https://openweathermap.org/api) (free tier)

### Setup

```bash
cp .env.example .env
# Edite .env: OPENWEATHER_API_KEY, JWT_SECRET (min 32 chars), ADMIN_PASS

docker-compose up --build
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

## Tecnologias

| Camada | Stack |
|---|---|
| **Reverse Proxy** | Nginx 1.27 Alpine |
| **API Gateway** | Node.js 20 + TypeScript + Fastify 4 + jsonwebtoken + axios |
| **Weather Backend** | Java 21 + Spring Boot 3.3 + Elasticsearch 8 |
| **NPS Backend** | Node.js 20 + TypeScript + Fastify 4 + Prisma 5 + PostgreSQL 15 |
| **Frontend** | Next.js 14 + shadcn/ui + Tailwind + Recharts + Leaflet |
| **Infra** | Docker + Docker Compose |

---

**Contato:** diogobenicio@hotmail.com | [LinkedIn](https://linkedin.com/in/diogosbenicio)
