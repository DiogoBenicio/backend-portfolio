# Portfolio Frontend

Landing page + dashboard com visualizações de clima e formulário NPS.
Construído com Next.js 14 App Router + shadcn/ui + Tailwind CSS.

## Seções

| Rota                 | Descrição                                                                             |
| -------------------- | ------------------------------------------------------------------------------------- |
| `/`                  | Landing page com Hero (foto, dados, tech stack, arquitetura)                          |
| `/dashboard/weather` | Dashboard de clima: busca por cidade, clima atual, gráficos Recharts, previsão 5 dias |
| `/dashboard/map`     | Mapa interativo Leaflet com marcadores de cidades e popup de clima em tempo real      |
| `/dashboard/nps`     | Formulário NPS (0-10) + painel de resultados com score, zonas e distribuição          |

## Design

- Paleta sóbria: `white/gray-50` fundo, `gray-900` texto, `blue-600` acento
- Gráficos monocromáticos em tons de azul (Recharts)
- `IconTexture` na hero section: grid de ícones Lucide com `opacity-[0.04]` como textura
- Sidebar com navegação responsiva (oculta em mobile)
- Totalmente responsivo com CSS Grid do Tailwind

## UI Library

**shadcn/ui** — componentes copiados em `src/components/ui/` com controle total:

- `Button`, `Card`, `Input`, `Badge`, `LoadingSpinner`, `ErrorMessage`

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
docker-compose up portfolio-frontend
```

## Dependências de APIs

- `NEXT_PUBLIC_WEATHER_API_URL` → Weather API (porta 8080)
- `NEXT_PUBLIC_NPS_API_URL` → NPS API (porta 3001)

## Stack

- Next.js 14 (App Router, output standalone)
- TypeScript 5
- shadcn/ui (Radix UI primitives)
- Tailwind CSS 3
- TanStack Query 5 (React Query)
- Recharts 2 (gráficos)
- Leaflet 1.9 + React-Leaflet 4 (mapa — importado dinamicamente para evitar SSR)
- Lucide React (ícones)
- Axios 1 (HTTP client)
