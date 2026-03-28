package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.port.in.GetWeatherCalendarUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;

import java.util.List;

public class GetWeatherCalendarService implements GetWeatherCalendarUseCase {

    private final WeatherDataRepository repository;

    public GetWeatherCalendarService(WeatherDataRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<String> execute(String city, int year, int month) {
        return repository.findDaysWithData(city, year, month);
    }
}
