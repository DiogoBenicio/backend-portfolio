package com.portfolio.weatherapi.adapter.out.elasticsearch;

import com.portfolio.weatherapi.adapter.out.elasticsearch.document.WeatherDocument;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class ElasticsearchWeatherAdapter implements WeatherDataRepository {

    private final ElasticsearchWeatherRepository repository;
    private final ElasticsearchOperations operations;

    public ElasticsearchWeatherAdapter(ElasticsearchWeatherRepository repository,
                                       ElasticsearchOperations operations) {
        this.repository = repository;
        this.operations = operations;
    }

    @Override
    public void save(Weather weather) {
        WeatherDocument doc = WeatherDocument.builder()
                .id(UUID.randomUUID().toString())
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
                .timestamp(weather.timestamp())
                .build();
        repository.save(doc);
    }

    @Override
    public Page<Weather> findByCity(String city, Instant from, Instant to, Pageable pageable) {
        Criteria criteria = new Criteria("city").is(city)
                .and(new Criteria("timestamp").between(from, to));
        CriteriaQuery query = new CriteriaQuery(criteria, pageable);

        SearchHits<WeatherDocument> hits = operations.search(query, WeatherDocument.class);
        List<Weather> content = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(this::toModel)
                .toList();

        return PageableExecutionUtils.getPage(content, pageable, hits::getTotalHits);
    }

    @Override
    public List<String> findDistinctCities() {
        Criteria criteria = new Criteria("city").exists();
        CriteriaQuery query = new CriteriaQuery(criteria);
        return operations.search(query, WeatherDocument.class).getSearchHits()
                .stream()
                .map(hit -> hit.getContent().getCity())
                .distinct()
                .sorted()
                .toList();
    }

    private Weather toModel(WeatherDocument doc) {
        return new Weather(
                doc.getCity(),
                doc.getCountry(),
                doc.getLatitude(),
                doc.getLongitude(),
                doc.getTemperature(),
                doc.getFeelsLike(),
                doc.getHumidity(),
                doc.getPressure(),
                doc.getWindSpeed(),
                doc.getWindDirection(),
                doc.getDescription(),
                doc.getIcon(),
                doc.getUvIndex(),
                doc.getRainfall(),
                doc.getTimestamp()
        );
    }
}
