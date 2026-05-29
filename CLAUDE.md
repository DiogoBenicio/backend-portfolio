# Portfolio Backend — Contexto para Claude Code

## Visão Geral

Portfólio Full Stack com microsserviços containerizados demonstrando arquitetura hexagonal, SOA, JWT, reverse proxy e observabilidade. Deploy em produção na Oracle Cloud (OCI) com HTTPS via Let's Encrypt.

## Serviços e Portas

| Serviço         | Tecnologia              | Porta Interna | Porta Externa |
|-----------------|-------------------------|---------------|---------------|
| nginx           | Nginx 1.27              | 80 / 443      | **80 / 443** (único entry point) |
| frontend        | Next.js 14 + TypeScript | —             | — (static export, servido pelo nginx) |
| gateway-api     | Node.js + Fastify       | 4000          | —             |
| nps-api         | Node.js + Fastify       | 3001          | —             |
| weather-api     | Java 21 + Spring Boot   | 8080          | —             |
| postgres        | PostgreSQL 15           | 5432          | —             |

## Estrutura de Pastas

```
/backend-portfolio/
├── docker-compose.yml       # Orquestração completa (profiles: prod para certbot)
├── nginx/                   # Reverse proxy (entry point único, dev + prod configs)
├── frontend/                # Next.js 14 (App Router, TanStack Query, shadcn/ui)
├── gateway-api/             # API Gateway (JWT auth, rate limit, proxy)
├── nps-api/                 # NPS API (Hexagonal, Prisma, PostgreSQL)
└── weather-api/             # Weather API (Hexagonal, JPA, PostgreSQL, OpenWeather)
```

## Arquiteturas

- **weather-api**: Hexagonal (Ports & Adapters). PostgreSQL via Spring Data JPA. ID determinístico `{city-slug}-{YYYY-MM-DD-HH}`.
- **nps-api**: Hexagonal. PostgreSQL via Prisma. Swagger em `/documentation`.
- **gateway-api**: SOA em camadas. Proxy reverso, rate limit (500/min global, 300/min heavy), CORS. Sem auth ativa — arquitetura preparada para JWT/OAuth2.
- **frontend**: Next.js static export. TanStack Query com cache (5min weather, 10min sensors). Tema escuro padrão.
- **nginx**: Único entry point. `/api/*` → gateway-api:4000, `/*` → static files (frontend build).

## Regras de Container (CRÍTICO)

**Sempre reconstruir** ao fazer qualquer mudança — nunca apenas reiniciar:

```bash
# Reconstruir tudo
docker compose down && docker compose up --build -d

# Reconstruir serviço específico
docker compose up --build -d <service-name>

# Ver logs em tempo real
docker compose logs -f <service-name>

# Status dos containers
docker compose ps
```

**Nomes dos serviços no docker-compose:**
- `nginx`, `gateway-api`, `nps-api`, `weather-api`, `postgres`

**Produção (OCI):**
```bash
docker compose --profile prod up --build -d <service-name>
```

## Versionamento (CRÍTICO)

Ao fazer bump de versão, atualizar **todos** os arquivos abaixo:

| Arquivo | Campo |
|---|---|
| `README.md` | badge `version`, entrada no Changelog |
| `frontend/src/app/page.tsx` | string `vX.X.X · Diogo Benício` |
| `frontend/package.json` | `"version"` |
| `gateway-api/package.json` | `"version"` |
| `nps-api/package.json` | `"version"` |
| `weather-api/pom.xml` | `<version>` do artefato |

Após atualizar:
```bash
git tag vX.X.X && git push && git push origin vX.X.X
```

## Variáveis de Ambiente

O arquivo `.env` na raiz é carregado pelo `docker-compose.yml`. Cada serviço também tem seu próprio `.env`.

Variáveis principais:
- `OPENWEATHER_API_KEY` — OpenWeather API
- `POSTGRES_PASSWORD` — senha do PostgreSQL
- `CORS_ORIGINS` — origens permitidas no gateway (separadas por vírgula)
- `NGINX_CONF` — `nginx.dev.conf` (dev) ou `nginx.prod.conf` (prod)
- `DOMAIN` — domínio para certificado Let's Encrypt (apenas prod)

## Rede Docker

Todos os serviços estão na rede `portfolio-network` (bridge). Comunicação interna usa nome do container (ex: `http://weather-api:8080`).

## Comandos de Desenvolvimento Local (sem Docker)

```bash
# gateway-api / nps-api / frontend
npm run dev

# weather-api
mvn spring-boot:run

# frontend build estático
npm run build
```

## Lint e Formato (obrigatório antes de commits)

```bash
# Frontend
cd frontend && npx prettier --write "src/**/*.{ts,tsx}" && npx next lint

# gateway-api / nps-api
npx prettier --write "src/**/*.{ts,js}" && npx eslint src
```

## Testes

```bash
# Node.js (vitest ou jest)
npm test
npm run test:coverage

# Java
mvn test
```

## Documentação por Serviço

- Cada serviço tem `README.md` e `architecture.md` próprios.
- Swagger UI disponível internamente em cada API.
