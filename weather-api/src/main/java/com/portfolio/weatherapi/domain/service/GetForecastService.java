package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.port.in.GetForecastUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

public class GetForecastService implements GetForecastUseCase {

    private final WeatherProviderClient providerClient;

    public GetForecastService(WeatherProviderClient providerClient) {
        this.providerClient = providerClient;
    }

    @Override
    public Forecast execute(String city, int days) {
        int clampedDays = Math.min(Math.max(days, 1), 5);
        return providerClient.fetchForecast(city, clampedDays);
    }
}
