package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.GetWeatherSensorsUseCase;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class GetWeatherSensorsService implements GetWeatherSensorsUseCase {

    private static final Logger log = LoggerFactory.getLogger(GetWeatherSensorsService.class);
    private static final DateTimeFormatter HOUR_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd-HH").withZone(ZoneOffset.UTC);

    private final WeatherDataRepository repository;
    private final WeatherProviderClient weatherProvider;
    private final HistoricalWeatherClient historicalClient;

    public GetWeatherSensorsService(WeatherDataRepository repository,
                                    WeatherProviderClient weatherProvider,
                                    HistoricalWeatherClient historicalClient) {
        this.repository = repository;
        this.weatherProvider = weatherProvider;
        this.historicalClient = historicalClient;
    }

    @Override
    public List<Weather> execute(String city, Instant from, Instant to) {
        List<Weather> existing = repository.findSensorData(city, from, to);

        String citySlug = city.toLowerCase().replaceAll("[^a-z0-9]", "-");
        Set<String> existingIds = new HashSet<>();
        for (Weather w : existing) {
            existingIds.add(citySlug + "-" + HOUR_FMT.format(w.timestamp().truncatedTo(ChronoUnit.HOURS)));
        }

        // Verifica se há alguma hora faltante no range
        Instant now    = Instant.now().truncatedTo(ChronoUnit.HOURS);
        Instant cursor = from.truncatedTo(ChronoUnit.HOURS);
        Instant end    = to.truncatedTo(ChronoUnit.HOURS);

        boolean hasGap = false;
        while (!cursor.isAfter(end) && !cursor.isAfter(now)) {
            if (!existingIds.contains(citySlug + "-" + HOUR_FMT.format(cursor))) {
                hasGap = true;
                break;
            }
            cursor = cursor.plus(1, ChronoUnit.HOURS);
        }

        if (!hasGap) {
            return existing;
        }

        // Obtém coordenadas: usa dados existentes no ES ou busca current weather
        double lat = 0, lon = 0;
        if (!existing.isEmpty()) {
            lat = existing.get(0).latitude();
            lon = existing.get(0).longitude();
        } else {
            try {
                Weather current = weatherProvider.fetchCurrentWeather(city, null);
                lat = current.latitude();
                lon = current.longitude();
            } catch (Exception e) {
                log.warn("Gap-fill: não foi possível obter coordenadas para '{}': {}", city, e.getMessage());
                return existing;
            }
        }

        log.info("Gap-fill: buscando histórico via Open-Meteo para '{}' ({}, {})", city, lat, lon);
        List<Weather> historical;
        try {
            historical = historicalClient.fetchHistoricalHourly(city, lat, lon, from, to);
        } catch (Exception e) {
            log.warn("Gap-fill: falha ao buscar Open-Meteo para '{}': {}", city, e.getMessage());
            return existing;
        }

        // Persiste apenas slots novos dentro do range (não futuros)
        int saved = 0;
        for (Weather point : historical) {
            Instant slotHour = point.timestamp().truncatedTo(ChronoUnit.HOURS);
            if (slotHour.isAfter(now)) continue;
            String slotId = citySlug + "-" + HOUR_FMT.format(slotHour);
            if (!slotHour.isBefore(from) && !slotHour.isAfter(end)
                    && !existingIds.contains(slotId)) {
                repository.save(point);
                existingIds.add(slotId);
                saved++;
            }
        }

        log.info("Gap-fill: {} ponto(s) salvos para '{}'", saved, city);

        if (saved == 0) return existing;

        return repository.findSensorData(city, from, to);
    }
}
