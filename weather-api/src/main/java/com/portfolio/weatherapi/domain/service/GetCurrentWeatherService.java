package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.GetCurrentWeatherUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

public class GetCurrentWeatherService implements GetCurrentWeatherUseCase {

    private final WeatherProviderClient providerClient;
    private final WeatherDataRepository repository;

    public GetCurrentWeatherService(WeatherProviderClient providerClient, WeatherDataRepository repository) {
        this.providerClient = providerClient;
        this.repository = repository;
    }

    @Override
    public Weather execute(String city, String country) {
        Weather weather = providerClient.fetchCurrentWeather(city, country);
        repository.save(weather);
        return weather;
    }
}
