# Frontend — Arquitetura

## Stack

- **Next.js 14** (App Router, static export)
- **TypeScript**
- **Tailwind CSS + shadcn/ui** (Radix UI primitives)
- **TanStack Query (React Query v5)** — cache e sincronização de dados remotos
- **Recharts** — gráficos de clima e sensores
- **Leaflet + react-leaflet** — mapa interativo com tiles ESRI satélite
- **next-themes** — tema claro/escuro (padrão: escuro)

## Estrutura de pastas

```
src/
├── app/                        # Rotas do App Router (Next.js)
│   ├── page.tsx                # Landing page
│   ├── providers.tsx           # ThemeProvider, QueryClient, RateLimitProvider
│   └── dashboard/
│       ├── weather/            # Dashboard de clima
│       ├── nps/                # Formulário e resultados NPS
│       ├── map/                # Mapa de cidades (Leaflet + ESRI)
│       └── ecosystem/          # Diagrama arquitetural e status
├── components/
│   ├── weather/                # Cards, gráficos, SensorChart, CalendarHeatmap
│   ├── nps/                    # NpsForm, ScoreSelector
│   ├── ecosystem/              # ArchitectureDiagram, ServiceStatusBar, LiveMetrics
│   ├── layout/                 # Sidebar, MobileTopBar, PageContainer
│   ├── landing/                # HeroSection, TechStackSection
│   └── ui/                     # Primitivos reutilizáveis (button, card, badge...)
├── context/
│   └── RateLimitContext.tsx    # Usage gate (30 min) + bloqueio de 1h
├── hooks/                      # useCurrentWeather, useForecast, useWeatherSensors,
│                               # useWeatherCalendar, useServiceHealth
├── lib/api/                    # weatherClient (Axios), npsClient (Axios)
└── types/                      # Interfaces TypeScript (weather, forecast, nps)
```

## Fluxo de dados

```
Browser → Nginx (reverse proxy :443)
       → Gateway-API (rate limit + proxy reverso)
       → Weather-API / NPS-API
```

Todas as chamadas passam pelo gateway em `/api/*`. O cliente nunca acessa os serviços diretamente.

## React Query

- `staleTime` configurado por rota: 5min (current weather), 10min (sensors), 1min (forecast)
- `refetchOnWindowFocus: false` em health checks para evitar flood
- Cache de sensores históricos mantido por 10min (backend faz gap-fill, dado é completo)

## Usage Gate

- Timer acumulado no `localStorage` (`usage-start`)
- Após 30 minutos em `/dashboard/weather` ou `/dashboard/map`: modal bloqueia por 1h
- Bloco persiste entre sessões via `rl-blocked-until` no `localStorage`
- Reset automático após expirar 1h

## Componentes chave

| Componente            | Responsabilidade                                          |
| --------------------- | --------------------------------------------------------- |
| `SensorChart`         | Gráfico de linha multi-eixo com 9 sensores togláveis      |
| `CalendarHeatmap`     | Heatmap mensal — dias com dados no PostgreSQL destacados  |
| `WeatherMap`          | Mapa Leaflet com satélite ESRI + fronteiras + radar       |
| `ArchitectureDiagram` | Diagrama SVG dinâmico com status em tempo real            |
| `RateLimitModal`      | Modal de usage gate com countdown e redirecionamento NPS  |
| `NavigationProgress`  | Overlay de loading durante navegação entre páginas        |
| `Sidebar`             | Navegação colapsável com fade de conteúdo na animação     |
