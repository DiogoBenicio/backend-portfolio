# Weather-API — Arquitetura

## Stack
- **Java 21 + Spring Boot 3.3**
- **Arquitetura Hexagonal (Ports & Adapters)**
- **PostgreSQL 15** — armazenamento de séries temporais via Spring Data JPA
- **OpenWeather API** — clima atual e previsão de 5 dias
- **Open-Meteo Archive API** — dados históricos horários (gratuito, sem token)

## Estrutura de pacotes

```
com.portfolio.weatherapi/
├── domain/
│   ├── model/              # Weather, Forecast, ForecastDay, City
│   ├── port/
│   │   ├── in/             # Use cases (interfaces de entrada)
│   │   └── out/            # WeatherDataRepository, WeatherProviderClient,
│   │                       # HistoricalWeatherClient
│   └── service/            # Implementações dos use cases
├── adapter/
│   ├── in/
│   │   └── web/            # WeatherController, GlobalExceptionHandler, WeatherMapper
│   └── out/
│       ├── openweather/    # OpenWeatherClientAdapter (clima atual + forecast)
│       ├── openmeteo/      # OpenMeteoClientAdapter (histórico horário)
│       └── postgres/       # PostgresWeatherAdapter + WeatherEntity (JPA)
├── application/
│   └── dto/                # DTOs de request/response (SensorPointResponse, etc.)
└── config/
    ├── UseCaseConfig.java  # Wiring manual dos use cases (sem @Service no domínio)
    └── WebConfig.java      # CORS
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/weather/current` | Clima atual via OpenWeather |
| `GET` | `/weather/forecast` | Previsão 5 dias via OpenWeather |
| `GET` | `/weather/sensors` | Série histórica horária com gap-fill automático |
| `GET` | `/weather/calendar` | Dias com dados no PostgreSQL para o mês/ano |
| `GET` | `/weather/history` | Paginação de registros históricos |
| `POST` | `/weather/populate` | Seed de dados históricos (idempotente) |

## Gap-fill automático (`/sensors`)

```
1. Consulta PostgreSQL: findSensorData(city, from, to)
2. Calcula horas esperadas no intervalo
3. Detecta gaps comparando IDs determinísticos {slug}-{YYYY-MM-DD-HH}
4. Se gap → chama Open-Meteo Archive (1 requisição para todo o período)
5. Salva apenas os slots novos (idempotente por ID)
6. Re-query PostgreSQL → retorna série completa e ordenada
```

## PostgreSQL

- ID determinístico: `{city-slug}-{YYYY-MM-DD-HH}` (garante idempotência)
- Tabela única `weather_data` com índices em `city` e `timestamp`
- Compartilha instância com nps-api

## Decisão de Arquitetura: PostgreSQL no lugar do Elasticsearch

A API foi projetada originalmente com Elasticsearch como adapter de saída. A troca para PostgreSQL foi cirúrgica graças à arquitetura hexagonal — nenhum use case, porta ou controller foi alterado:

```
Antes: [ Use Cases ] → WeatherDataRepository ← ElasticsearchWeatherAdapter
Depois:                                       ← PostgresWeatherAdapter
```

O Elasticsearch consumia ~512–700 MB de heap, inviabilizando deploy em instâncias free tier (1 GB RAM total). O PostgreSQL resolve o mesmo problema com ~30–50 MB em idle.

## Campos do modelo Weather

| Campo | Fonte | Observação |
|---|---|---|
| temperature | OpenWeather / Open-Meteo | °C |
| feelsLike | OpenWeather / Open-Meteo | Sensação térmica °C |
| humidity | OpenWeather / Open-Meteo | % |
| pressure | OpenWeather / Open-Meteo | hPa (superfície) |
| windSpeed | OpenWeather / Open-Meteo | km/h |
| rainfall | OpenWeather / Open-Meteo | mm |
| dewPoint | Open-Meteo | Ponto de orvalho °C |
| radiation | Open-Meteo | Radiação solar global W/m² |
| uvIndex | Open-Meteo (calculado) | shortwave_radiation / 25 |
