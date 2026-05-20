package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.port.in.GetDistinctCitiesUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;

import java.util.List;

public class GetDistinctCitiesService implements GetDistinctCitiesUseCase {

    private final WeatherDataRepository repository;

    public GetDistinctCitiesService(WeatherDataRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<String> execute() {
        return repository.findDistinctCities();
    }
}
