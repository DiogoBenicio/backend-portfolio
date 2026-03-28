# Frontend — Arquitetura

## Stack
- **Next.js 14** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query (React Query)** — cache e sincronização de dados remotos
- **Recharts** — gráficos de clima e sensores
- **Leaflet** — mapa interativo

## Estrutura de pastas

```
src/
├── app/                        # Rotas do App Router (Next.js)
│   ├── page.tsx                # Landing page
│   ├── dashboard/
│   │   ├── weather/            # Dashboard de clima
│   │   ├── nps/                # Formulário e resultados NPS
│   │   ├── map/                # Mapa de cidades
│   │   └── ecosystem/          # Diagrama arquitetural e status
├── components/
│   ├── weather/                # Cards, gráficos, SensorChart, CalendarHeatmap
│   ├── nps/                    # NpsForm, ScoreSelector
│   ├── ecosystem/              # ArchitectureDiagram, ServiceStatusBar, LiveMetrics
│   ├── layout/                 # Sidebar, MobileTopBar, PageContainer
│   ├── landing/                # HeroSection, TechStackSection
│   └── ui/                     # Primitivos reutilizáveis (button, card, badge...)
├── hooks/                      # useCurrentWeather, useForecast, useWeatherSensors,
│                               # useWeatherCalendar, useServiceHealth
├── lib/
│   └── api/                    # weatherClient (Axios), npsClient (Axios)
└── types/                      # Interfaces TypeScript (weather, forecast, nps)
```

## Fluxo de dados

```
Browser → Nginx (reverse proxy :80)
       → Gateway-API (autenticação JWT + rate limit)
       → Weather-API / NPS-API
```

Todas as chamadas passam pelo gateway em `/api/*`. O cliente nunca acessa os serviços diretamente.

## React Query

- `staleTime` configurado por rota: 5min (current weather), 10min (sensors), 1min (forecast)
- `refetchOnWindowFocus: false` em health checks para evitar flood
- Cache de sensores históricos mantido por 10min (backend faz gap-fill, dado é completo)

## Componentes chave

| Componente | Responsabilidade |
|---|---|
| `SensorChart` | Gráfico de linha multi-eixo com 9 sensores togláveis |
| `CalendarHeatmap` | Heatmap mensal de disponibilidade de dados no ES |
| `ArchitectureDiagram` | Diagrama SVG dinâmico com status em tempo real |
| `RateLimitModal` | Modal de feedback ao atingir rate limit do gateway |
| `DateRangePicker` | Seletor de período restrito a ontem — 5 dias atrás |
