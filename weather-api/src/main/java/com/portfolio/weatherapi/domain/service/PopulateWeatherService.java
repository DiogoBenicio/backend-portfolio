package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.PopulateWeatherUseCase;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;

public class PopulateWeatherService implements PopulateWeatherUseCase {

    private static final Logger log = LoggerFactory.getLogger(PopulateWeatherService.class);

    private final WeatherProviderClient weatherProvider;
    private final HistoricalWeatherClient historicalClient;
    private final WeatherDataRepository repository;

    public PopulateWeatherService(WeatherProviderClient weatherProvider,
                                  HistoricalWeatherClient historicalClient,
                                  WeatherDataRepository repository) {
        this.weatherProvider = weatherProvider;
        this.historicalClient = historicalClient;
        this.repository = repository;
    }

    @Override
    public Weather execute(String city, LocalDate date) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        if (date.isBefore(today)) {
            // Past date: use historical client (Open-Meteo) instead of OpenWeather current
            return populateHistorical(city, date);
        }

        // Today or future: fetch current weather from OpenWeather
        Weather fetched = weatherProvider.fetchCurrentWeather(city, null);

        // Store with noon-UTC timestamp of the requested date (idempotent slot)
        Instant noonOfDate = date.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        Weather snapshot = new Weather(
                fetched.city(), fetched.country(),
                fetched.latitude(), fetched.longitude(),
                fetched.temperature(), fetched.feelsLike(),
                fetched.humidity(), fetched.pressure(),
                fetched.windSpeed(), fetched.windDirection(),
                fetched.description(), fetched.icon(),
                fetched.uvIndex(), fetched.rainfall(),
                fetched.dewPoint(), fetched.radiation(),
                noonOfDate
        );
        repository.save(snapshot);
        return snapshot;
    }

    private Weather populateHistorical(String city, LocalDate date) {
        // Resolve coordinates via current weather before calling Open-Meteo
        Weather current = weatherProvider.fetchCurrentWeather(city, null);
        double lat = current.latitude();
        double lon = current.longitude();

        Instant from = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to   = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        log.info("PopulateWeatherService: buscando histórico Open-Meteo para '{}' em {} ({}, {})", city, date, lat, lon);
        List<Weather> historical = historicalClient.fetchHistoricalHourly(city, lat, lon, from, to);

        if (historical.isEmpty()) {
            throw new IllegalStateException(
                    "Open-Meteo não retornou dados históricos para '" + city + "' em " + date);
        }

        // Prefer the noon slot; fall back to first available point
        Instant noonOfDate = date.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        Weather representative = historical.stream()
                .filter(w -> w.timestamp().truncatedTo(java.time.temporal.ChronoUnit.HOURS)
                              .equals(noonOfDate.truncatedTo(java.time.temporal.ChronoUnit.HOURS)))
                .findFirst()
                .orElse(historical.get(0));

        for (Weather point : historical) {
            repository.save(point);
        }
        log.info("PopulateWeatherService: {} ponto(s) histórico(s) salvos para '{}' em {}", historical.size(), city, date);

        return representative;
    }
}
