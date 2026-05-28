# Weather API

API RESTful que consulta a OpenWeather API e armazena dados históricos no PostgreSQL.

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Arquitetura Hexagonal

```
domain/
  model/        → Java records (Weather, Forecast, ForecastDay, City)
  port/in/      → Casos de uso: GetCurrentWeatherUseCase, GetForecastUseCase,
                  GetWeatherHistoryUseCase, GetWeatherSensorsUseCase, RefreshWeatherUseCase
  port/out/     → Portas: WeatherProviderClient, HistoricalWeatherClient, WeatherDataRepository
  service/      → Implementações puras (zero Spring annotations)

adapter/
  in/web/       → WeatherController (@RestController), GlobalExceptionHandler
  out/
    openweather/  → OpenWeatherClientAdapter (WebClient — clima atual e previsão)
    openmeteo/    → OpenMeteoClientAdapter (WebClient — histórico horário)
    postgres/     → PostgresWeatherAdapter (Spring Data JPA)

config/          → UseCaseConfig (wiring dos beans), WebConfig (CORS + Swagger)
application/dto/ → DTOs de resposta (records imutáveis)
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/v1/weather/current?city=` | Clima atual via OpenWeather |
| GET | `/api/v1/weather/forecast?city=&days=5` | Previsão 5 dias |
| GET | `/api/v1/weather/history?city=&from=&to=&page=&size=` | Histórico paginado |
| GET | `/api/v1/weather/sensors?city=&from=&to=` | Dados horários para gráficos |
| GET | `/api/v1/weather/calendar?city=&year=&month=` | Heatmap mensal |
| GET | `/api/v1/weather/cities` | Cidades com dados persistidos |
| POST | `/api/v1/weather/populate?city=&date=` | Seed de dados históricos (idempotente) |
| GET | `/swagger-ui.html` | Documentação interativa |
| GET | `/actuator/health` | Health check |

## PostgreSQL

- ID determinístico: `{city-slug}-{YYYY-MM-DD-HH}` (garante idempotência)
- Gap-fill automático via Open-Meteo quando há lacunas no histórico
- Compartilha instância PostgreSQL com o nps-api

## Executar localmente

```bash
# Requisitos: Java 21, Maven 3.9+, PostgreSQL 15 em localhost:5432

cp .env.example .env
# Edite .env com sua OPENWEATHER_API_KEY e POSTGRES_PASSWORD

mvn spring-boot:run
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker compose up --build -d postgres weather-api
docker compose logs -f weather-api
```

## Testes

```bash
mvn test
```
