# NPS API

API RESTful para coleta e análise de NPS (Net Promoter Score).

![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify_5-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Arquitetura Hexagonal

```
domain/
  model/        → NpsResponse, NpsSummary (lógica NPS pura: classifyScore, calculateNps, getZone)
  port/in/      → SubmitNpsScoreUseCase, GetNpsSummaryUseCase, ListNpsResponsesUseCase
  port/out/     → NpsResponseRepository
  service/      → SubmitNpsScoreService, GetNpsSummaryService, ListNpsResponsesService

adapter/
  in/http/      → NpsController (Fastify routes), schemas JSON Schema
  out/database/ → PrismaNpsResponseRepository

main.ts         → Wiring manual (DI sem container)
server.ts       → Fastify instance, plugins (CORS, Swagger)
```

## Lógica NPS

```
Promotores (9-10) — Passivos (7-8) — Detratores (0-6)
NPS = ((Promotores - Detratores) / Total) * 100

Zonas:
  -100 →  0:  Crítico
     1 → 50:  Aperfeiçoamento
    51 → 75:  Qualidade
    76 → 100: Excelência
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/v1/nps/responses` | Submeter avaliação NPS |
| GET | `/api/v1/nps/summary?page=` | Sumário e score NPS |
| GET | `/api/v1/nps/responses?limit=&offset=` | Listar respostas (paginado) |
| DELETE | `/api/v1/nps/responses/:id` | Remover resposta |
| GET | `/api/v1/health` | Health check |
| GET | `/documentation` | Swagger UI |

## Executar localmente

```bash
# Requisitos: Node.js 20, PostgreSQL 15

cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker compose up --build -d postgres nps-api
docker compose logs -f nps-api
```

## Testes

```bash
npm test
npm run test:coverage
```
