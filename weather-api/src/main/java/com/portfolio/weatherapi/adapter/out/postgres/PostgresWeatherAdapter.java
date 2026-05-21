package com.portfolio.weatherapi.adapter.out.postgres;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@Transactional(readOnly = true)
public class PostgresWeatherAdapter implements WeatherDataRepository {

    private static final DateTimeFormatter HOUR_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd-HH").withZone(ZoneOffset.UTC);

    private final WeatherJpaRepository repository;

    public PostgresWeatherAdapter(WeatherJpaRepository repository) {
        this.repository = repository;
    }

    private String entityId(String city, Instant timestamp) {
        String slug = city.toLowerCase().replaceAll("[^a-z0-9]", "-");
        Instant hour = timestamp.truncatedTo(ChronoUnit.HOURS);
        return slug + "-" + HOUR_FMT.format(hour);
    }

    private WeatherEntity toEntity(Weather w) {
        return WeatherEntity.builder()
                .id(entityId(w.city(), w.timestamp()))
                .city(w.city())
                .country(w.country())
                .latitude(w.latitude())
                .longitude(w.longitude())
                .temperature(w.temperature())
                .feelsLike(w.feelsLike())
                .humidity(w.humidity())
                .pressure(w.pressure())
                .windSpeed(w.windSpeed())
                .windDirection(w.windDirection())
                .description(w.description())
                .icon(w.icon())
                .uvIndex(w.uvIndex())
                .rainfall(w.rainfall())
                .dewPoint(w.dewPoint())
                .radiation(w.radiation())
                .timestamp(w.timestamp())
                .build();
    }

    private Weather toModel(WeatherEntity e) {
        return new Weather(
                e.getCity(), e.getCountry(),
                e.getLatitude(), e.getLongitude(),
                e.getTemperature(), e.getFeelsLike(),
                e.getHumidity(), e.getPressure(),
                e.getWindSpeed(), e.getWindDirection(),
                e.getDescription(), e.getIcon(),
                e.getUvIndex(), e.getRainfall(),
                e.getDewPoint(), e.getRadiation(),
                e.getTimestamp());
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void save(Weather weather) {
        WeatherEntity entity = toEntity(weather);
        if (!repository.existsById(entity.getId())) {
            repository.save(entity);
        }
    }

    @Override
    public Page<Weather> findByCity(String city, Instant from, Instant to, Pageable pageable) {
        return repository.findByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThan(city, from, to, pageable)
                .map(this::toModel);
    }

    @Override
    public List<Weather> findSensorData(String city, Instant from, Instant to) {
        return repository.findTop500ByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThanOrderByTimestampAsc(city, from, to)
                .stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    public List<String> findDaysWithData(String city, int year, int month) {
        Instant from = LocalDate.of(year, month, 1).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant to   = LocalDate.of(year, month, 1).plusMonths(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        return repository.findDaysWithData(city, from, to);
    }

    @Override
    public List<String> findDistinctCities() {
        return repository.findDistinctCities();
    }
}
