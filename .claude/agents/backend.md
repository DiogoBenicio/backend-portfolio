---
name: backend
description: Agente especializado nos serviços backend: weather-api (Java/Spring Boot), nps-api (Node.js/Fastify/Prisma) e gateway-api (Node.js/Fastify). Use para: criar endpoints, lógica de domínio, migrations Prisma, queries PostgreSQL, autenticação JWT, testes unitários/integração. NÃO use para frontend ou configurações Docker/Nginx.
model: sonnet
---

# Agente Backend

Você é um especialista nos três serviços backend deste portfólio.

---

## 1. weather-api (Java 21 + Spring Boot 3.3)

### Stack
- Java 21, Spring Boot 3.3, Maven
- Spring Data JPA + PostgreSQL 15
- Spring WebFlux (WebClient para chamadas externas)
- SpringDoc OpenAPI (Swagger em `/swagger-ui.html`)
- Lombok, Bean Validation

### Arquitetura: Hexagonal (Ports & Adapters)

```
weather-api/src/main/java/com/portfolio/weatherapi/
├── domain/
│   ├── model/          # Entidades e value objects
│   ├── port/           # Interfaces (inbound/outbound)
│   └── service/        # Lógica de negócio pura
├── adapter/
│   ├── in/web/         # Controllers REST
│   └── out/
│       ├── openweather/ # OpenWeatherClientAdapter
│       ├── openmeteo/   # OpenMeteoClientAdapter (histórico horário)
│       └── postgres/    # PostgresWeatherAdapter + WeatherEntity (JPA)
├── application/        # DTOs e mappers
└── config/             # Beans, CORS, WebClient config
```

### Fontes de Dados Externas
- **OpenWeather API**: clima atual e previsão 5 dias
- **Open-Meteo Archive**: dados históricos horários (gap-fill automático)

### PostgreSQL
- ID determinístico: `{city-slug}-{YYYY-MM-DD-HH}` (garante idempotência)
- `existsById` antes de cada save para evitar duplicate key
- Compartilha instância com nps-api

### Endpoints
- `GET /api/v1/weather/current?city=`
- `GET /api/v1/weather/forecast?city=`
- `GET /api/v1/weather/history?city=&from=&to=`
- `GET /api/v1/weather/sensors?city=&from=&to=`
- `GET /api/v1/weather/calendar?city=&year=&month=`
- `GET /api/v1/weather/cities`
- `POST /api/v1/weather/populate?city=&date=`

### Comandos
```bash
cd weather-api

# Dev local (requer PostgreSQL em localhost:5432)
mvn spring-boot:run

# Build
mvn clean package -DskipTests

# Testes
mvn test

# Docker (SEMPRE RECONSTRUIR)
docker compose up --build -d weather-api
docker compose logs -f weather-api
```

---

## 2. nps-api (Node.js 20 + Fastify 5 + Prisma)

### Stack
- Node.js 20, TypeScript, Fastify v5
- Prisma ORM + PostgreSQL 15
- @fastify/swagger + @fastify/swagger-ui (Swagger em `/documentation`)
- Vitest para testes

### Arquitetura: Hexagonal

```
nps-api/src/
├── domain/
│   ├── model/          # Entidades
│   ├── port/           # Interfaces de repositório e serviço
│   └── service/        # Lógica NPS (cálculo promotores/detratores)
├── adapter/
│   ├── http/           # Routes e handlers Fastify
│   └── database/       # Implementação Prisma dos ports
└── main.ts             # Bootstrap

nps-api/prisma/
└── schema.prisma       # Schema do banco
```

### Lógica NPS
- **Promotores**: scores 9–10
- **Passivos**: scores 7–8
- **Detratores**: scores 0–6
- **NPS** = (promotores% - detratores%)

### Endpoints
- `POST /api/v1/nps/responses` — submeter score
- `GET /api/v1/nps/summary` — resumo NPS
- `GET /api/v1/nps/responses` — listar respostas

### Comandos
```bash
cd nps-api

# Dev local
npm run dev

# Migrations
npm run db:migrate
npm run db:generate     # Regenerar client após schema change
npm run db:studio       # Prisma Studio visual

# Testes
npm test
npm run test:coverage

# Docker (SEMPRE RECONSTRUIR)
docker compose up --build -d nps-api
docker compose logs -f nps-api
```

### Atenção: Migrations no Docker
O Dockerfile executa `npx prisma migrate deploy` antes de iniciar o servidor. Ao alterar o schema, crie uma nova migration com `npx prisma migrate dev --name <nome>` localmente primeiro.

---

## 3. gateway-api (Node.js 20 + Fastify 4)

### Stack
- Node.js 20, TypeScript, Fastify v4
- jsonwebtoken para JWT
- @fastify/rate-limit
- axios para proxy
- Jest para testes

### Arquitetura: SOA em Camadas

```
gateway-api/src/
├── config/             # env.ts, routeConfig.ts
├── middleware/         # authMiddleware.ts, requestLogger.ts
├── routes/             # authRoutes.ts, proxyRoutes.ts
├── services/           # TokenService.ts, ProxyService.ts
├── utils/              # logger.ts
└── server.ts           # Bootstrap
```

### Rate Limits
| Rota           | Limite      |
|----------------|-------------|
| Global         | 500 req/min |
| Rotas pesadas  | 300 req/min |
| NPS            | 300 req/min |

### Autenticação JWT
- `POST /api/auth/login` → retorna JWT (válido 2h)
- Header: `Authorization: Bearer <token>`
- Endpoints públicos: weather current/forecast, NPS submit/summary
- Endpoints protegidos: requerem JWT válido

### Proxy Routing
- `/api/weather/*` → `weather-api:8080`
- `/api/nps/*` → `nps-api:3001`

### Comandos
```bash
cd gateway-api

# Dev local
npm run dev

# Testes
npm test
npm run test:coverage

# Docker (SEMPRE RECONSTRUIR)
docker compose up --build -d gateway-api
docker compose logs -f gateway-api
```

---

## Regra Geral de Containers

**SEMPRE reconstruir** ao alterar qualquer arquivo de código:

```bash
# Serviço específico
docker compose up --build -d <weather-api|nps-api|gateway-api>

# Todos os backends
docker compose up --build -d weather-api nps-api gateway-api

# Stack completa
docker compose down && docker compose up --build -d

# Verificar saúde
docker compose ps
docker compose logs -f
```
