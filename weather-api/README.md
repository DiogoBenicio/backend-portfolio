# Weather API

API RESTful que consulta a OpenWeather API e armazena dados históricos no Elasticsearch 8.

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch_8-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)
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
    elasticsearch/ → ElasticsearchWeatherAdapter (Spring Data ES)

config/          → UseCaseConfig (wiring dos beans), WebConfig (CORS + Swagger)
application/dto/ → DTOs de resposta (records imutáveis)
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/v1/weather/current?city=` | Clima atual via OpenWeather |
| GET | `/api/v1/weather/forecast?city=&days=5` | Previsão 5 dias |
| GET | `/api/v1/weather/history?city=&from=&to=&page=&size=` | Histórico (Elasticsearch) |
| GET | `/api/v1/weather/sensors?city=&from=&to=` | Dados horários para gráficos |
| GET | `/api/v1/weather/calendar?city=&year=&month=` | Heatmap mensal |
| GET | `/api/v1/weather/cities` | Cidades com dados indexados |
| POST | `/api/v1/weather/refresh` | Forçar atualização no Elasticsearch |
| GET | `/swagger-ui.html` | Documentação interativa |
| GET | `/actuator/health` | Health check |

## Elasticsearch

- Índices mensais: `weather-data-YYYY-MM`
- ID determinístico: `{city-slug}-{YYYY-MM-DD-HH}`
- Gap-fill automático: Open-Meteo preenche lacunas no histórico

## Executar localmente

```bash
# Requisitos: Java 21, Maven 3.9+, Elasticsearch 8 em localhost:9200

cp .env.example .env
# Edite .env com sua OPENWEATHER_API_KEY

mvn spring-boot:run
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker compose up --build -d elasticsearch weather-api
docker compose logs -f weather-api
```

## Testes

```bash
mvn test
```
