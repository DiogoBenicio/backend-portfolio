# NPS-API — Arquitetura

## Stack
- **Node.js + Fastify 4**
- **TypeScript**
- **Arquitetura Hexagonal (Ports & Adapters)**
- **Prisma ORM**
- **PostgreSQL** — persistência das respostas NPS

## Estrutura de pastas

```
src/
├── domain/
│   ├── model/              # NpsResponse, NpsSummary
│   ├── port/
│   │   ├── in/             # SubmitNpsScoreUseCase, GetNpsSummaryUseCase,
│   │   │                   # ListNpsResponsesUseCase
│   │   └── out/            # NpsResponseRepository
│   └── service/            # Implementações dos use cases
├── adapter/
│   ├── in/                 # Rotas Fastify (controllers)
│   └── out/                # PrismaRepository (implementação do port)
├── config/                 # Configuração de injeção de dependências
└── main.ts                 # Bootstrap do servidor
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/nps/submit` | Submete uma avaliação (score 0–10 + comentário opcional) |
| `GET` | `/nps/summary` | Retorna média, total e distribuição por score |
| `GET` | `/nps/responses` | Lista paginada de respostas |

## Modelo de dados

```
NpsResponse {
  id        String    @id @default(uuid())
  score     Int       // 0-10
  comment   String?
  createdAt DateTime  @default(now())
}
```

## Cálculo NPS

```
Promotores  = scores 9-10
Detratores  = scores 0-6
NPS = (promotores - detratores) / total × 100
```

## Rate limit

As rotas `/api/nps/*` têm rate limit próprio no Gateway (300 req/min), mais generoso que o global (100 req/min), para garantir que o formulário de feedback funcione mesmo após o usuário ter atingido o limite nas outras rotas.
