# NPS API

API RESTful em Node.js 20 + TypeScript + Fastify 4 para coleta e análise de NPS (Net Promoter Score).

## Arquitetura Hexagonal

```
domain/
  model/          → NpsResponse, NpsSummary (com lógica NPS pura: classifyScore, calculateNps, getZone)
  port/in/        → SubmitNpsScoreUseCase, GetNpsSummaryUseCase, ListNpsResponsesUseCase
  port/out/       → NpsResponseRepository
  service/        → SubmitNpsScoreService, GetNpsSummaryService, ListNpsResponsesService

adapter/
  in/http/        → NpsController (Fastify routes), schemas JSON Schema
  out/database/   → PrismaNpsResponseRepository

main.ts           → Wiring manual (DI sem container)
server.ts         → Fastify instance, plugins (CORS, Swagger)
```

## Lógica NPS

```
Promotores (9-10) — Passivos (7-8) — Detratores (0-6)
NPS = ((Promotores - Detratores) / Total) * 100

Zonas:
  -100 → 0:   Crítico
   1   → 50:  Aperfeiçoamento
   51  → 75:  Qualidade
   76  → 100: Excelência
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/v1/nps/responses` | Submeter avaliação NPS |
| GET | `/api/v1/nps/summary?page=` | Sumário e score NPS |
| GET | `/api/v1/nps/responses?limit=&offset=` | Listar respostas (paginado) |
| GET | `/api/v1/health` | Health check |
| GET | `/documentation` | Swagger UI |

## Executar localmente

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker-compose up postgres nps-api
```

## Testes

```bash
npm test
npm run test:coverage
```

## Stack

- Node.js 20 LTS + TypeScript 5
- Fastify 4 (validação JSON Schema nativa)
- Prisma 5 (ORM type-safe)
- PostgreSQL 15
- Vitest (testes unitários)
