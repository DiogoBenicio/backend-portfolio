# Backend Portfolio — Diogo Silveira Benício

> Full Stack Engineer | Node.js • React • Java • PostgreSQL | Cloud & Data Platforms

Portfólio técnico com 5 microsserviços interconectados demonstrando arquitetura hexagonal, SOA, segurança com JWT e infraestrutura containerizada. Deploy em produção na Oracle Cloud (OCI) com HTTPS via Let's Encrypt.

[![Version](https://img.shields.io/badge/version-v1.0.2-blue?style=flat-square)](https://github.com/DiogoBenicio/backend-portfolio/releases/tag/v1.0.2)
[![Live](https://img.shields.io/badge/live-diogoportfolio.opiniaolivre.com-green?style=flat-square)](https://diogoportfolio.opiniaolivre.com)

---

## Stack

### Infraestrutura
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Oracle Cloud](https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Let's Encrypt](https://img.shields.io/badge/Let's_Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)
![Oracle Cloud](https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Let's Encrypt](https://img.shields.io/badge/Let's_Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

### API Gateway
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Weather API
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

### NPS API
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

---

## Projetos

| Projeto | Stack |
|---|---|
| [nginx](./nginx) | Nginx 1.27 |
| [gateway-api](./gateway-api) | Node.js 20 + Fastify + JWT |
| [weather-api](./weather-api) | Java 21 + Spring Boot 3.3 + PostgreSQL |
| [nps-api](./nps-api) | Node.js 20 + Fastify + Prisma + PostgreSQL 15 |
| [frontend](./frontend) | Next.js 14 + shadcn/ui + Tailwind |

---

## Arquitetura de Segurança

```
Internet
   ↓
Nginx (HTTPS/TLS) ──── único ponto de entrada ────────────────
   │
   ├── /          → Next.js Frontend
   │
   └── /api/*     → API Gateway
                       │
                       ├── JWT validation (rotas protegidas)
                       ├── Rate limiting (30 req/min)
                       ├── Request logging estruturado
                       │
                       ├── /api/weather/* → Weather API
                       │                        └── PostgreSQL
                       └── /api/nps/*    → NPS API
                                                └── PostgreSQL
```

**Superfície de ataque:** antes 5 portas expostas → agora **1 porta** (Nginx)

---


## Arquiteturas por Projeto

**Weather API & NPS API** — Arquitetura Hexagonal (Ports & Adapters):
- `domain/` — entidades e lógica de negócio puros, zero dependência de framework
- `domain/port/in/` — casos de uso (interfaces driving)
- `domain/port/out/` — portas de saída (interfaces driven)
- `adapter/in/` — controllers REST
- `adapter/out/` — repositórios e clientes externos

**Gateway API** — Arquitetura em Camadas SOA:
- `config/` — configuração estática (env, routes, upstreams)
- `services/` — TokenService (JWT), ProxyService (HTTP proxy)
- `middleware/` — authMiddleware (JWT hook), rateLimitPlugin, requestLogger
- `routes/` — authRoutes (`/api/auth/*`), proxyRoutes (`/api/weather/*`, `/api/nps/*`)

---

## Decisão de Arquitetura: PostgreSQL no lugar do Elasticsearch

A Weather API foi projetada originalmente com **Elasticsearch 8** como banco de persistência histórica — uma escolha técnica válida para buscas full-text e agregações em séries temporais. O Elasticsearch aparece nos badges, no diagrama de arquitetura e na documentação dos serviços porque **faz parte do portfólio como escolha de design**.

Na prática, porém, o Elasticsearch consome ~512–700 MB de heap sozinho, inviabilizando o deploy em qualquer instância cloud de free tier (geralmente 1 GB de RAM total). Para que o portfólio pudesse rodar em produção sem custo, o **adapter de saída** foi trocado para PostgreSQL — que já existe na stack para o NPS API.

A troca foi cirúrgica graças à arquitetura hexagonal:

```
Antes: WeatherProviderClient → [ Use Cases ] → WeatherDataRepository ← ElasticsearchWeatherAdapter
Depois:                                                               ← PostgresWeatherAdapter
```

Nenhum use case, porta ou controller foi alterado. O domínio permanece agnóstico à tecnologia de persistência — exatamente o benefício que a arquitetura hexagonal promete.

| | Elasticsearch | PostgreSQL |
|---|---|---|
| RAM em idle | ~512–700 MB | ~30–50 MB |
| Custo cloud (free tier) | Inviável | Viável |
| Busca full-text nativa | Sim | Não necessário aqui |
| Séries temporais simples | Sim | Sim (índices + range queries) |

---

## Como Executar

### Pré-requisitos
- Docker + Docker Compose
- Chave da [OpenWeather API](https://openweathermap.org/api) (free tier)

### Setup

```bash
cp .env.example .env
# Edite .env: OPENWEATHER_API_KEY, JWT_SECRET (mín. 32 chars), ADMIN_PASS

docker compose up --build -d
```

### Acessos após subir

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost |
| **API Gateway** (via Nginx) | http://localhost/api/* |
| **Health Nginx** | http://localhost/nginx-health |
| **Health Gateway** | http://localhost/api/health |


---

## Changelog

### v1.0.2 — 2026-05-28
- GitHub e LinkedIn na Hero section
- Botão Observabilidade na Hero section
- Usage gate removido — modal só aparece em erros 429 reais da API
- Documentação atualizada (CLAUDE.md, READMEs, architecture.md, agents)
- Referências a Elasticsearch restauradas na UI (CalendarHeatmap)

### v1.0.1 — 2026-05-21
- Download de Currículo PDF na Hero section
- Rate limits da API afrouxados (500 req/min global, 300 req/min rotas pesadas)
- 429 da API desacoplado do usage gate de 1h
- Usage gate aumentado de 10 para 30 minutos
- Sidebar: fade de conteúdo durante animação de colapso
- Correção de ícones centralizados no sidebar colapsado

### v1.0.0 — 2026-05-21
- Deploy em produção na Oracle Cloud (OCI) com HTTPS automático via Let's Encrypt
- Migração Elasticsearch → PostgreSQL na Weather API (arquitetura hexagonal preservada)
- Dashboard de Clima: gráficos históricos, mapa Leaflet com tiles CartoDB, calendário heatmap
- Dashboard NPS: formulário de avaliação, gráfico de distribuição, histórico de respostas
- Painel de Observabilidade: métricas de sistema, status dos serviços, logs em tempo real
- Usage gate: bloqueio por tempo de navegação com modal e redirecionamento para NPS
- Sidebar responsivo com animação de colapso e fade de conteúdo
- Proteção SSH com fail2ban na VM de produção

---

**Contato:** diogobenicio@hotmail.com | [LinkedIn](https://linkedin.com/in/diogosbenicio)
