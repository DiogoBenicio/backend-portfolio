# API Gateway

Gateway centralizado com proxy reverso, rate limiting e arquitetura preparada para autenticação.

![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify_4-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Arquitetura SOA em Camadas

```
config/     → env.ts (variáveis tipadas), routeConfig.ts (upstreams, rewrite rules)
services/   → ProxyService (forward HTTP com headers e timeout)
middleware/ → requestLogger (log estruturado de todas as requisições)
routes/     → proxyRoutes (proxy dinâmico /api/weather/* + /api/nps/*), metricsRoutes
server.ts   → Fastify instance, plugins (CORS, rate-limit), wiring das camadas
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/health` | Health check do gateway |
| GET | `/api/weather/*` | Proxy → weather-api |
| GET/POST/DELETE | `/api/nps/*` | Proxy → nps-api |
| GET | `/api/metrics` | Métricas do sistema (CPU, memória, disco) |
| GET | `/api/inmet-alerts` | Alertas meteorológicos INMET |

## Path Rewrite

O gateway reescreve o path antes de encaminhar ao upstream:

```
/api/weather/current  →  weather-api:8080/api/v1/weather/current
/api/nps/summary      →  nps-api:3001/api/v1/nps/summary
```

## Rate Limits

| Escopo | Limite |
|---|---|
| Global | 500 req/min por IP |
| Rotas pesadas (sensors, calendar, populate) | 300 req/min por IP |
| Rotas NPS | 300 req/min por IP |

## Preparado para autenticação

A arquitetura em camadas foi projetada para suportar mecanismos de segurança sem modificações estruturais. O hook `onRequest` do Fastify permite adicionar autenticação (JWT, API Key, OAuth2) como middleware global ou por rota:

```typescript
// Exemplo: adicionar JWT em qualquer momento
server.addHook("onRequest", authMiddleware);
```

O `ProxyService` já descarta headers sensíveis antes de encaminhar ao upstream, e o `routeConfig.ts` centraliza o mapeamento de rotas, facilitando a definição de regras de acesso por prefixo.

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
