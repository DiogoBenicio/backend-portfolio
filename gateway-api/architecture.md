# Gateway-API — Arquitetura

## Stack
- **Node.js 20 + Fastify 4**
- **TypeScript**
- **@fastify/rate-limit** — rate limiting por IP
- **@fastify/cors** — controle de origens

## Responsabilidades

1. **Rate limiting** — proteção contra abuso (500 req/min global, 300 req/min em rotas pesadas)
2. **Proxy reverso** — encaminha requisições para os serviços internos
3. **Roteamento** — mapeia `/api/weather/*` → Weather-API, `/api/nps/*` → NPS-API
4. **Observabilidade** — log estruturado de todas as requisições + endpoint `/api/metrics`

## Estrutura de pastas

```
src/
├── config/
│   ├── env.ts              # Variáveis de ambiente tipadas
│   └── routeConfig.ts      # Upstreams e regras de reescrita de path
├── middleware/
│   └── requestLogger.ts    # Log estruturado de todas as requisições
├── routes/
│   ├── proxyRoutes.ts      # Registro de todas as rotas /api/*
│   └── metricsRoutes.ts    # Métricas do sistema e alertas INMET
├── services/
│   └── ProxyService.ts     # Encaminhamento HTTP para upstreams
└── utils/
    └── logger.ts           # Logger estruturado (pino)
```

## Rate limits

| Escopo | Limite | Janela |
|---|---|---|
| Global (todas as rotas) | 500 req/min | 1 minuto |
| Rotas pesadas (`/sensors`, `/calendar`, `/populate`) | 300 req/min | 1 minuto |
| Rotas NPS (`/api/nps/*`) | 300 req/min | 1 minuto |

## Fluxo de uma requisição

```
Browser
  → Nginx (:443)
    → Gateway-API (:4000)
        1. rateLimit      — verifica contadores por IP
        2. requestLogger  — registra método, path, IP
        3. proxyHandler   — resolve upstream via routeConfig
        4. ProxyService.forward() — HTTP para o serviço interno
        5. Retorna resposta ao cliente
```

## Preparado para autenticação

A arquitetura foi desenhada para receber camadas de segurança sem mudanças estruturais. O hook global `onRequest` do Fastify é o ponto de extensão natural:

```typescript
// JWT
server.addHook("onRequest", jwtMiddleware);

// API Key
server.addHook("onRequest", apiKeyMiddleware);

// OAuth2 / OIDC
server.addHook("onRequest", oauthMiddleware);
```

O `routeConfig.ts` centraliza o mapeamento de rotas, permitindo definir regras de acesso (rotas públicas vs. protegidas) em um único lugar. O `ProxyService` já descarta headers de autenticação antes de encaminhar ao upstream, garantindo que os serviços internos nunca recebam tokens do cliente.
