package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.RefreshWeatherUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

public class RefreshWeatherService implements RefreshWeatherUseCase {

    private final WeatherProviderClient providerClient;
    private final WeatherDataRepository repository;

    public RefreshWeatherService(WeatherProviderClient providerClient, WeatherDataRepository repository) {
        this.providerClient = providerClient;
        this.repository = repository;
    }

    @Override
    public Weather execute(String city) {
        Weather weather = providerClient.fetchCurrentWeather(city, null);
        repository.save(weather);
        return weather;
    }
}
