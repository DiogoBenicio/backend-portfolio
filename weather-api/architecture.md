# Weather-API — Arquitetura

## Stack
- **Java 21 + Spring Boot 3**
- **Arquitetura Hexagonal (Ports & Adapters)**
- **Elasticsearch 8** — armazenamento de séries temporais (índices mensais)
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
│       └── elasticsearch/  # ElasticsearchWeatherAdapter + WeatherDocument
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
| `GET` | `/weather/calendar` | Dias com dados no ES para o mês/ano |
| `GET` | `/weather/history` | Paginação de registros históricos |
| `POST` | `/weather/refresh` | Força atualização do clima atual no ES |

## Gap-fill automático (`/sensors`)

```
1. Consulta ES: findSensorData(city, from, to)
2. Calcula horas esperadas no intervalo
3. Detecta gaps comparando IDs determinísticos {slug}-{YYYY-MM-DD-HH}
4. Se gap → chama Open-Meteo Archive (1 requisição para todo o período)
5. Salva apenas os slots novos no ES (idempotente por ID)
6. Re-query ES → retorna série completa e ordenada
```

## Elasticsearch

- Índices mensais: `weather-data-YYYY-MM`
- ID determinístico: `{city-slug}-{YYYY-MM-DD-HH}` (garante idempotência)
- Criação de índice automática com mapping do `WeatherDocument`

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
