package com.portfolio.weatherapi.adapter.out.openweather;

import com.portfolio.weatherapi.adapter.out.openweather.dto.OpenWeatherCurrentResponse;
import com.portfolio.weatherapi.adapter.out.openweather.dto.OpenWeatherForecastResponse;
import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.model.ForecastDay;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
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

        return mapToForecast(response, days);
    }

    private Weather mapToWeather(OpenWeatherCurrentResponse r) {
        String description = r.weather() != null && !r.weather().isEmpty()
                ? r.weather().get(0).description() : "";
        String icon = r.weather() != null && !r.weather().isEmpty()
                ? r.weather().get(0).icon() : "";
        String windDir = degToCompass(r.wind() != null ? r.wind().deg() : 0);
        double rainfall = r.rain() != null && r.rain().oneHour() != null ? r.rain().oneHour() : 0.0;

        return Weather.of(
                r.name(),
                r.sys() != null ? r.sys().country() : "",
                r.coord().lat(),
                r.coord().lon(),
                r.main().temp(),
                r.main().feelsLike(),
                r.main().humidity(),
                r.main().pressure(),
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
                    return LocalDate.parse(item.dtTxt(), FORECAST_FORMATTER);
                }, LinkedHashMap::new, Collectors.toList()));

        List<ForecastDay> forecastDays = byDay.entrySet().stream()
                .limit(days)
                .map(entry -> {
                    List<OpenWeatherForecastResponse.ForecastItem> items = entry.getValue();
                    double tempMin = items.stream().mapToDouble(i -> i.main().tempMin()).min().orElse(0);
                    double tempMax = items.stream().mapToDouble(i -> i.main().tempMax()).max().orElse(0);
                    int humidity = (int) items.stream().mapToInt(i -> i.main().humidity()).average().orElse(0);
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

        return new Forecast(r.city().name(), r.city().country(), forecastDays);
    }

    private String degToCompass(int deg) {
        String[] dirs = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"};
        return dirs[(int) Math.round(deg / 45.0) % 8];
    }
}
