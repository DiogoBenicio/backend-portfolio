package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.GetWeatherHistoryUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Instant;

public class GetWeatherHistoryService implements GetWeatherHistoryUseCase {

    private final WeatherDataRepository repository;

    public GetWeatherHistoryService(WeatherDataRepository repository) {
        this.repository = repository;
    }

    @Override
    public Page<Weather> execute(String city, Instant from, Instant to, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return repository.findByCity(city, from, to, pageable);
    }
}
