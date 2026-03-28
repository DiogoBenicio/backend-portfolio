package com.portfolio.weatherapi.adapter.out.elasticsearch;

import com.portfolio.weatherapi.adapter.out.elasticsearch.document.WeatherDocument;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class ElasticsearchWeatherAdapter implements WeatherDataRepository {

    private static final DateTimeFormatter HOUR_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd-HH").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter MONTH_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM").withZone(ZoneOffset.UTC);

    private final ElasticsearchOperations operations;

    public ElasticsearchWeatherAdapter(ElasticsearchOperations operations) {
        this.operations = operations;
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private String monthIndex(Instant timestamp) {
        return "weather-data-" + MONTH_FMT.format(timestamp);
    }

    private String documentId(String city, Instant timestamp) {
        String slug = city.toLowerCase().replaceAll("[^a-z0-9]", "-");
        Instant hour = timestamp.truncatedTo(ChronoUnit.HOURS);
        return slug + "-" + HOUR_FMT.format(hour);
    }

    /** Returns all monthly index names that cover the [from, to] window. */
    private String[] indicesBetween(Instant from, Instant to) {
        YearMonth start = YearMonth.from(from.atZone(ZoneOffset.UTC));
        YearMonth end   = YearMonth.from(to.atZone(ZoneOffset.UTC));
        List<String> names = new ArrayList<>();
        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            names.add("weather-data-" + ym);
        }
        return names.toArray(String[]::new);
    }

    /** Ensures the monthly index exists (creates if absent, applies mapping from WeatherDocument). */
    private void ensureIndex(String indexName) {
        IndexOperations ops = operations.indexOps(IndexCoordinates.of(indexName));
        if (!ops.exists()) {
            ops.create();
            ops.putMapping(operations.indexOps(WeatherDocument.class).createMapping());
        }
    }

    private Weather toModel(WeatherDocument doc) {
        return new Weather(
                doc.getCity(), doc.getCountry(),
                doc.getLatitude(), doc.getLongitude(),
                doc.getTemperature(), doc.getFeelsLike(),
                doc.getHumidity(), doc.getPressure(),
                doc.getWindSpeed(), doc.getWindDirection(),
                doc.getDescription(), doc.getIcon(),
                doc.getUvIndex(), doc.getRainfall(),
                doc.getDewPoint(), doc.getRadiation(),
                doc.getTimestamp());
    }

    // ─── WeatherDataRepository ────────────────────────────────────────────────

    @Override
    public void save(Weather weather) {
        String indexName = monthIndex(weather.timestamp());
        ensureIndex(indexName);

        WeatherDocument doc = WeatherDocument.builder()
                .id(documentId(weather.city(), weather.timestamp()))
                .city(weather.city())
                .country(weather.country())
                .latitude(weather.latitude())
                .longitude(weather.longitude())
                .temperature(weather.temperature())
                .feelsLike(weather.feelsLike())
                .humidity(weather.humidity())
                .pressure(weather.pressure())
                .windSpeed(weather.windSpeed())
                .windDirection(weather.windDirection())
                .description(weather.description())
                .icon(weather.icon())
                .uvIndex(weather.uvIndex())
                .rainfall(weather.rainfall())
                .dewPoint(weather.dewPoint())
                .radiation(weather.radiation())
                .timestamp(weather.timestamp())
                .build();

        operations.save(doc, IndexCoordinates.of(indexName));
    }

    @Override
    public Page<Weather> findByCity(String city, Instant from, Instant to, Pageable pageable) {
        String[] indices = indicesBetween(from, to);
        Criteria criteria = new Criteria("city").is(city)
                .and(new Criteria("timestamp").between(from, to));
        CriteriaQuery query = new CriteriaQuery(criteria, pageable);

        SearchHits<WeatherDocument> hits = operations.search(
                query, WeatherDocument.class, IndexCoordinates.of(indices));
        List<Weather> content = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(this::toModel)
                .toList();

        return PageableExecutionUtils.getPage(content, pageable, hits::getTotalHits);
    }

    @Override
    public List<Weather> findSensorData(String city, Instant from, Instant to) {
        String[] indices = indicesBetween(from, to);
        Criteria criteria = new Criteria("city").is(city)
                .and(new Criteria("timestamp").between(from, to));
        Pageable pageable = PageRequest.of(0, 500, Sort.by(Sort.Direction.ASC, "timestamp"));
        CriteriaQuery query = new CriteriaQuery(criteria, pageable);

        return operations.search(query, WeatherDocument.class, IndexCoordinates.of(indices))
                .getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(this::toModel)
                .toList();
    }

    @Override
    public List<String> findDaysWithData(String city, int year, int month) {
        String indexName = "weather-data-" + String.format("%04d-%02d", year, month);
        IndexOperations ops = operations.indexOps(IndexCoordinates.of(indexName));
        if (!ops.exists()) {
            return List.of();
        }

        Instant monthStart = LocalDate.of(year, month, 1)
                .atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant monthEnd = LocalDate.of(year, month, 1)
                .plusMonths(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        Criteria criteria = new Criteria("city").is(city)
                .and(new Criteria("timestamp").between(monthStart, monthEnd));
        CriteriaQuery query = new CriteriaQuery(criteria,
                PageRequest.of(0, 1000, Sort.by(Sort.Direction.ASC, "timestamp")));

        return operations.search(query, WeatherDocument.class, IndexCoordinates.of(indexName))
                .getSearchHits().stream()
                .map(hit -> hit.getContent().getTimestamp()
                        .atZone(ZoneOffset.UTC).toLocalDate().toString())
                .distinct()
                .sorted()
                .toList();
    }

    @Override
    public List<String> findDistinctCities() {
        return List.of();
    }
}
