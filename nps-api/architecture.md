# NPS-API — Arquitetura

## Stack
- **Node.js 20 + Fastify 5**
- **TypeScript**
- **Arquitetura Hexagonal (Ports & Adapters)**
- **Prisma ORM**
- **PostgreSQL 15** — persistência das respostas NPS

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
| `POST` | `/nps/responses` | Submete uma avaliação (score 0–10 + comentário opcional) |
| `GET` | `/nps/summary` | Retorna score NPS, total e distribuição |
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

Zonas:
  -100 →  0:  Crítico
     1 → 50:  Aperfeiçoamento
    51 → 75:  Qualidade
    76 → 100: Excelência
```

## Rate limit

As rotas `/api/nps/*` têm rate limit próprio no Gateway (300 req/min), igual ao global elevado, garantindo que o formulário de feedback funcione sem restrições para visitantes normais.
