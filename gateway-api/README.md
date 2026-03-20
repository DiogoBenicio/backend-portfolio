# API Gateway

Gateway centralizado com autenticação JWT e proxy reverso para os serviços internos.
Arquitetura em camadas SOA (Service-Oriented Architecture).

## Camadas

```
config/       → env.ts (variáveis tipadas), routeConfig.ts (upstreams, rewrite rules, rotas públicas)
services/     → TokenService (JWT sign/verify/refresh), ProxyService (forward HTTP com headers)
middleware/   → authMiddleware (hook onRequest: JWT validation), requestLogger (log estruturado)
routes/       → authRoutes (login/refresh), proxyRoutes (proxy dinâmico /api/weather/* + /api/nps/*)
server.ts     → Fastify instance, plugins (CORS, rate-limit), wiring das camadas
```

## Endpoints

| Método | Path | JWT | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | ✗ | Login — retorna JWT |
| POST | `/api/auth/refresh` | ✓ | Renova JWT |
| GET | `/api/weather/current` | ✗ | Proxy → weather-api |
| GET | `/api/weather/forecast` | ✗ | Proxy → weather-api |
| GET | `/api/weather/history` | ✓ | Proxy → weather-api |
| GET | `/api/weather/cities` | ✓ | Proxy → weather-api |
| POST | `/api/weather/refresh` | ✓ | Proxy → weather-api |
| POST | `/api/nps/responses` | ✗ | Proxy → nps-api |
| GET | `/api/nps/summary` | ✗ | Proxy → nps-api |
| GET | `/api/nps/responses` | ✓ | Proxy → nps-api |
| GET | `/health` | ✗ | Health check |

## Path Rewrite

O gateway reescreve o path antes de encaminhar ao upstream:
```
/api/weather/current  →  weather-api:8080/api/v1/weather/current
/api/nps/summary      →  nps-api:3001/api/v1/nps/summary
```

## Obter Token

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin2025"}'

# Resposta:
# { "token": "eyJ...", "tokenType": "Bearer", "expiresIn": "2h" }
```

## Usar Token

```bash
curl http://localhost/api/weather/history?city=Uberlândia \
  -H "Authorization: Bearer <token>"
```

## Stack

- Node.js 20 + TypeScript 5
- Fastify 4 (hooks onRequest, rate-limit plugin)
- jsonwebtoken (RS256 sign/verify)
- axios (HTTP proxy para upstreams)
