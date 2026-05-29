package com.portfolio.weatherapi.adapter.out.openweather;

import com.portfolio.weatherapi.adapter.out.openweather.dto.OpenWeatherCurrentResponse;
import com.portfolio.weatherapi.adapter.out.openweather.dto.OpenWeatherForecastResponse;
import com.portfolio.weatherapi.domain.model.CityWindData;
import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.model.ForecastDay;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class OpenWeatherClientAdapter implements WeatherProviderClient {

    private static final Logger log = LoggerFactory.getLogger(OpenWeatherClientAdapter.class);
    private static final DateTimeFormatter FORECAST_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final WebClient webClient;
    private final OpenWeatherProperties properties;

    public OpenWeatherClientAdapter(WebClient.Builder webClientBuilder, OpenWeatherProperties properties) {
        this.properties = properties;
        this.webClient = webClientBuilder
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Override
    public Weather fetchCurrentWeather(String city, String country) {
        String query = country != null ? city + "," + country : city;
        log.debug("Fetching current weather for: {}", query);

        OpenWeatherCurrentResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/weather")
                        .queryParam("q", query)
                        .queryParam("appid", properties.getApiKey())
                        .queryParam("units", properties.getUnits())
                        .queryParam("lang", properties.getLang())
                        .build())
                .retrieve()
                .bodyToMono(OpenWeatherCurrentResponse.class)
                .block();

        if (response == null) {
            throw new IllegalStateException("OpenWeather retornou resposta vazia para: " + query);
        }
        return mapToWeather(response);
    }

    @Override
    public Forecast fetchForecast(String city, int days) {
        log.debug("Fetching forecast for: {} ({} days)", city, days);

        OpenWeatherForecastResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/forecast")
                        .queryParam("q", city)
                        .queryParam("appid", properties.getApiKey())
                        .queryParam("units", properties.getUnits())
                        .queryParam("lang", properties.getLang())
                        .queryParam("cnt", days * 8) // API retorna de 3h em 3h (8x por dia)
                        .build())
                .retrieve()
                .bodyToMono(OpenWeatherForecastResponse.class)
                .block();

        if (response == null) {
            throw new IllegalStateException("OpenWeather retornou resposta vazia para forecast: " + city);
        }
        return mapToForecast(response, days);
    }

    @Override
    public List<Weather> fetchHourlySnapshots(String city) {
        log.debug("Fetching hourly snapshots for: {}", city);

        OpenWeatherForecastResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/forecast")
                        .queryParam("q", city)
                        .queryParam("appid", properties.getApiKey())
                        .queryParam("units", properties.getUnits())
                        .queryParam("lang", properties.getLang())
                        .queryParam("cnt", 40) // máximo: 5 dias × 8 slots de 3h
                        .build())
                .retrieve()
                .bodyToMono(OpenWeatherForecastResponse.class)
                .block();

        if (response == null || response.list() == null) return List.of();

        // BUG C5-A: null check for city()
        String cityName = response.city() != null && response.city().name() != null ? response.city().name() : "";
        String country  = response.city() != null && response.city().country() != null ? response.city().country() : "";
        double lat = response.city() != null && response.city().coord() != null ? response.city().coord().lat() : 0.0;
        double lon = response.city() != null && response.city().coord() != null ? response.city().coord().lon() : 0.0;

        return response.list().stream()
                .map(item -> {
                    String desc = item.weather() != null && !item.weather().isEmpty()
                            ? item.weather().get(0).description() : "";
                    String icon = item.weather() != null && !item.weather().isEmpty()
                            ? item.weather().get(0).icon() : "";
                    double rainfall = item.rain() != null && item.rain().threeHour() != null
                            ? item.rain().threeHour() : 0.0;
                    double windSpeed = item.wind() != null ? item.wind().speed() * 3.6 : 0.0;
                    String windDir   = item.wind() != null ? degToCompass(item.wind().deg()) : "N";

                    // BUG C5-B: null check for item.main()
                    double temp      = item.main() != null ? item.main().temp() : 0.0;
                    double feelsLike = item.main() != null ? item.main().feelsLike() : 0.0;
                    int humidity     = item.main() != null ? item.main().humidity() : 0;
                    int pressure     = item.main() != null ? item.main().pressure() : 0;

                    return new Weather(
                            cityName, country,
                            lat, lon,
                            temp, feelsLike,
                            humidity, pressure,
                            windSpeed, windDir,
                            desc, icon,
                            0, rainfall,
                            0.0, 0.0,
                            Instant.ofEpochSecond(item.dt())
                    );
                })
                .toList();
    }

    private Weather mapToWeather(OpenWeatherCurrentResponse r) {
        String description = r.weather() != null && !r.weather().isEmpty()
                ? r.weather().get(0).description() : "";
        String icon = r.weather() != null && !r.weather().isEmpty()
                ? r.weather().get(0).icon() : "";
        String windDir = degToCompass(r.wind() != null ? r.wind().deg() : 0);
        double rainfall = r.rain() != null && r.rain().oneHour() != null ? r.rain().oneHour() : 0.0;

        double temp      = r.main() != null ? r.main().temp()      : 0.0;
        double feelsLike = r.main() != null ? r.main().feelsLike() : 0.0;
        int    humidity  = r.main() != null ? r.main().humidity()  : 0;
        int    pressure  = r.main() != null ? r.main().pressure()  : 0;

        return Weather.of(
                r.name() != null ? r.name() : "",
                r.sys() != null ? r.sys().country() : "",
                r.coord() != null ? r.coord().lat() : 0.0,
                r.coord() != null ? r.coord().lon() : 0.0,
                temp,
                feelsLike,
                humidity,
                pressure,
                r.wind() != null ? r.wind().speed() * 3.6 : 0.0, // m/s → km/h
                windDir,
                description,
                icon,
                0, // UV index não disponível no endpoint básico
                rainfall
        );
    }

    private Forecast mapToForecast(OpenWeatherForecastResponse r, int days) {
        // Agrupa por dia e pega min/max/description do meio-dia
        Map<LocalDate, List<OpenWeatherForecastResponse.ForecastItem>> byDay = r.list().stream()
                .collect(Collectors.groupingBy(item -> {
                    // Usa o formatter definido para parse do dt_txt retornado pelo OpenWeather
                    return LocalDateTime.parse(item.dtTxt(), FORECAST_FORMATTER).toLocalDate();
                }, LinkedHashMap::new, Collectors.toList()));

        List<ForecastDay> forecastDays = byDay.entrySet().stream()
                .limit(days)
                .map(entry -> {
                    List<OpenWeatherForecastResponse.ForecastItem> items = entry.getValue();
                    // BUG C5-B: null check for i.main()
                    double tempMin = items.stream().mapToDouble(i -> i.main() != null ? i.main().tempMin() : 0.0).min().orElse(0);
                    double tempMax = items.stream().mapToDouble(i -> i.main() != null ? i.main().tempMax() : 0.0).max().orElse(0);
                    int humidity = (int) items.stream().mapToInt(i -> i.main() != null ? i.main().humidity() : 0).average().orElse(0);
                    double rainfall = items.stream()
                            .mapToDouble(i -> i.rain() != null && i.rain().threeHour() != null ? i.rain().threeHour() : 0)
                            .sum();
                    // Prefere o item do meio-dia para descrição/ícone
                    OpenWeatherForecastResponse.ForecastItem midday = items.stream()
                            .filter(i -> i.dtTxt().contains("12:00:00"))
                            .findFirst().orElse(items.get(items.size() / 2));
                    String description = midday.weather() != null && !midday.weather().isEmpty()
                            ? midday.weather().get(0).description() : "";
                    String icon = midday.weather() != null && !midday.weather().isEmpty()
                            ? midday.weather().get(0).icon() : "";

                    return new ForecastDay(entry.getKey(), tempMin, tempMax, humidity, description, icon, rainfall);
                })
                .toList();

        // BUG C5-A: null check for r.city()
        return new Forecast(
                r.city() != null && r.city().name() != null ? r.city().name() : "",
                r.city() != null && r.city().country() != null ? r.city().country() : "",
                forecastDays);
    }

    @Override
    public List<CityWindData> fetchWindFieldData(List<String> cities) {
        log.debug("Fetching wind field data for {} cities in parallel", cities.size());

        return Flux.fromIterable(cities)
                .flatMap(city -> webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/weather")
                                .queryParam("q", city)
                                .queryParam("appid", properties.getApiKey())
                                .queryParam("units", properties.getUnits())
                                .build())
                        .retrieve()
                        .bodyToMono(OpenWeatherCurrentResponse.class)
                        .filter(r -> r.wind() != null && r.coord() != null)
                        .map(r -> {
                            double speedMs = r.wind().speed();
                            int deg = r.wind().deg();
                            double rad = (deg * Math.PI) / 180.0;
                            double u = -speedMs * Math.sin(rad);
                            double v = -speedMs * Math.cos(rad);
                            double rain = r.rain() != null && r.rain().oneHour() != null
                                    ? r.rain().oneHour() : 0.0;
                            return new CityWindData(r.name() != null ? r.name() : "", r.coord().lat(), r.coord().lon(), u, v, rain);
                        })
                        .onErrorResume(ex -> {
                            log.warn("Failed to fetch wind data for city '{}': {}", city, ex.getMessage());
                            return Mono.empty();
                        }))
                .collectList()
                .blockOptional()
                .orElseGet(List::of);
    }

    private String degToCompass(int deg) {
        String[] dirs = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"};
        // BUG M4: use +8 to guarantee positive index for negative degree values
        return dirs[((int) Math.round(deg / 45.0) % 8 + 8) % 8];
    }
}
