# Gateway-API — Arquitetura

## Stack
- **Node.js + Fastify 4**
- **TypeScript**
- **@fastify/rate-limit** — rate limiting por IP
- **@fastify/cors** — controle de origens

## Responsabilidades

1. **Autenticação JWT** — valida token em todas as rotas (`/api/*`)
2. **Rate limiting** — proteção contra abuso (configurável por rota)
3. **Proxy reverso** — encaminha requisições para os serviços internos
4. **Roteamento** — mapeia `/api/weather/*` → Weather-API, `/api/nps/*` → NPS-API

## Estrutura de pastas

```
src/
├── config/
│   ├── env.ts              # Variáveis de ambiente tipadas
│   └── routeConfig.ts      # Mapeamento de prefixos → upstream URLs
├── middleware/
│   ├── authMiddleware.ts   # Validação JWT (hook onRequest global)
│   └── requestLogger.ts    # Log estruturado de todas as requisições
├── routes/
│   ├── authRoutes.ts       # POST /auth/token — emissão de JWT
│   └── proxyRoutes.ts      # Registro de todas as rotas /api/*
├── services/
│   ├── ProxyService.ts     # Encaminhamento HTTP para upstreams
│   └── TokenService.ts     # Geração e validação de JWT
└── utils/
    └── logger.ts           # Logger estruturado (pino)
```

## Rate limits

| Escopo | Limite | Janela |
|---|---|---|
| Global (todas as rotas) | 100 req/min | 1 minuto |
| Rotas pesadas (`/sensors`, `/calendar`, `/populate`) | 30 req/min | 1 minuto |
| Rotas NPS (`/api/nps/*`) | 300 req/min | 1 minuto |

O NPS tem limite mais generoso para garantir que o formulário de feedback funcione mesmo após rate limit nas outras rotas.

## Fluxo de uma requisição

```
Browser
  → Nginx (:80)
    → Gateway-API (:3000)
        1. authMiddleware — valida JWT
        2. rateLimit — verifica contadores por IP
        3. proxyHandler — resolve upstream via routeConfig
        4. ProxyService.forward() — HTTP para o serviço interno
        5. Retorna resposta ao cliente
```

## Autenticação

- Token JWT emitido em `POST /auth/token` (sem credenciais — portfólio público)
- Armazenado no `localStorage` do frontend
- Enviado como `Authorization: Bearer <token>` em todas as requisições
