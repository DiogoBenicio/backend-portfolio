# Weather API

API RESTful em Java 21 + Spring Boot 3.3 que consulta a OpenWeather API e armazena dados históricos no Elasticsearch 8.

## Arquitetura Hexagonal

```
domain/
  model/        → Java records (Weather, Forecast, ForecastDay, City)
  port/in/      → Casos de uso: GetCurrentWeatherUseCase, GetForecastUseCase, GetWeatherHistoryUseCase, RefreshWeatherUseCase
  port/out/     → Portas: WeatherProviderClient, WeatherDataRepository
  service/      → Implementações puras (zero Spring annotations)

adapter/
  in/web/       → WeatherController (@RestController), GlobalExceptionHandler
  out/
    openweather/ → OpenWeatherClientAdapter (WebClient)
    elasticsearch/ → ElasticsearchWeatherAdapter (Spring Data ES)

config/         → UseCaseConfig (wiring dos beans), WebConfig (CORS + Swagger)
application/dto/ → DTOs de resposta (records imutáveis)
```

## Endpoints

| Método | Path | Descrição |
|---|---|---|
| GET | `/api/v1/weather/current?city=&country=` | Clima atual |
| GET | `/api/v1/weather/forecast?city=&days=5` | Previsão 5 dias |
| GET | `/api/v1/weather/history?city=&from=&to=&page=&size=` | Histórico (Elasticsearch) |
| GET | `/api/v1/weather/cities` | Cidades com dados |
| POST | `/api/v1/weather/refresh` | Forçar atualização |
| GET | `/swagger-ui.html` | Documentação |
| GET | `/actuator/health` | Health check |

## Executar localmente

```bash
# Requisitos: Java 21, Maven 3.9+, Elasticsearch 8 rodando em localhost:9200

cp .env.example .env
# Edite .env com sua OPENWEATHER_API_KEY

mvn spring-boot:run
```

## Executar via Docker

```bash
# Da raiz do repositório:
docker-compose up elasticsearch weather-api
```

## Testes

```bash
mvn test
```

## Stack

- Java 21 (records, sealed types)
- Spring Boot 3.3 (WebClient, Spring Data Elasticsearch, Actuator)
- Elasticsearch 8.x
- Springdoc OpenAPI 2 (Swagger UI)
- Maven 3.9
