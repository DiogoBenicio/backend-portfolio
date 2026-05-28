# Portfolio Frontend

Landing page + dashboards com visualizações de clima, mapa interativo e formulário NPS.

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Rotas

| Rota                   | Descrição                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| `/`                    | Landing page com hero, download de CV, stack e diagrama de arquitetura     |
| `/dashboard/weather`   | Clima atual, gráficos de sensores, previsão 5 dias e heatmap mensal        |
| `/dashboard/map`       | Mapa Leaflet com satélite ESRI, fronteiras de estados e popup de clima     |
| `/dashboard/nps`       | Formulário NPS (0–10) + painel com score, zonas e distribuição             |
| `/dashboard/ecosystem` | Diagrama interativo da arquitetura de microsserviços e status dos serviços |

## Design

- Tema escuro como padrão, alternável via toggle
- Gráficos em tons de azul (Recharts)
- Sidebar responsiva colapsável com animação de fade
- Totalmente responsivo (mobile-first)

## Cache (TanStack Query)

| Dado                | staleTime |
| ------------------- | --------- |
| Clima atual         | 5 min     |
| Sensores históricos | 10 min    |
| Previsão            | 1 min     |

## Executar localmente

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Acesse http://localhost:3000

## Executar via Docker

```bash
# Da raiz do repositório:
docker compose up --build -d nginx
docker compose logs -f nginx
```

## Testes

```bash
npm test
npm run test:coverage
```

## Stack

- Next.js 14 (App Router, static export)
- TypeScript 5
- Tailwind CSS 3 + shadcn/ui (Radix UI primitives)
- TanStack Query 5 (React Query — cache e estado de servidor)
- Recharts 2 (gráficos de temperatura, umidade, sensores)
- Leaflet 1.9 + React-Leaflet 4 (mapa com tiles ESRI satélite)
- Lucide React (ícones)
- Axios 1 (HTTP client)
- Vitest (testes unitários)
