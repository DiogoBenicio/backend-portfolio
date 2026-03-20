package com.portfolio.weatherapi.adapter.out.elasticsearch;

import com.portfolio.weatherapi.adapter.out.elasticsearch.document.WeatherDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.time.Instant;
import java.util.List;

public interface ElasticsearchWeatherRepository extends ElasticsearchRepository<WeatherDocument, String> {

    Page<WeatherDocument> findByCityIgnoreCaseAndTimestampBetween(
            String city, Instant from, Instant to, Pageable pageable
    );

    @Query("{\"terms\": {\"city\": {\"field\": \"city\"}}}")
    List<String> findDistinctCities();
}
