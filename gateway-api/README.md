# API Gateway

Gateway centralizado com autenticação JWT e proxy reverso para os serviços internos.

![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify_4-000000?style=for-the-badge&logo=fastify&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Arquitetura SOA em Camadas

```
config/     → env.ts (variáveis tipadas), routeConfig.ts (upstreams, rewrite rules, rotas públicas)
services/   → TokenService (JWT HS256 sign/verify/refresh), ProxyService (forward HTTP com headers)
middleware/ → authMiddleware (hook onRequest: validação JWT), requestLogger (log estruturado)
routes/     → authRoutes (login/refresh), proxyRoutes (proxy dinâmico /api/weather/* + /api/nps/*)
server.ts   → Fastify instance, plugins (CORS, rate-limit), wiring das camadas
```

## Endpoints

| Método | Path | JWT | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login — retorna JWT |
| POST | `/api/auth/refresh` | ✓ | Renova JWT |
| GET | `/api/weather/current` | — | Proxy → weather-api |
| GET | `/api/weather/forecast` | — | Proxy → weather-api |
| GET | `/api/weather/history` | ✓ | Proxy → weather-api |
| GET | `/api/weather/cities` | ✓ | Proxy → weather-api |
| POST | `/api/weather/refresh` | ✓ | Proxy → weather-api |
| POST | `/api/nps/responses` | — | Proxy → nps-api |
| GET | `/api/nps/summary` | — | Proxy → nps-api |
| GET | `/api/nps/responses` | ✓ | Proxy → nps-api |
| GET | `/health` | — | Health check |

## Path Rewrite

O gateway reescreve o path antes de encaminhar ao upstream:

```
/api/weather/current  →  weather-api:8080/api/v1/weather/current
/api/nps/summary      →  nps-api:3001/api/v1/nps/summary
```

## Rate Limits

| Escopo | Limite |
|---|---|
| Global | 100 req/min |
| Rotas pesadas (history, sensors) | 30 req/min |
| NPS submit | 300 req/min |

## Obter Token

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<ADMIN_PASS>"}'

# Resposta:
# { "token": "eyJ...", "tokenType": "Bearer", "expiresIn": "2h" }
```

## Usar Token

```bash
curl "http://localhost/api/weather/history?city=Uberlândia" \
  -H "Authorization: Bearer <token>"
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker compose up --build -d gateway-api
docker compose logs -f gateway-api
```

## Testes

```bash
npm test
npm run test:coverage
```
