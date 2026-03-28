package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.PopulateWeatherUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;

public class PopulateWeatherService implements PopulateWeatherUseCase {

    private final WeatherProviderClient weatherProvider;
    private final WeatherDataRepository repository;

    public PopulateWeatherService(WeatherProviderClient weatherProvider,
                                  WeatherDataRepository repository) {
        this.weatherProvider = weatherProvider;
        this.repository = repository;
    }

    @Override
    public Weather execute(String city, LocalDate date) {
        // Fetch current weather data from provider
        Weather fetched = weatherProvider.fetchCurrentWeather(city, null);

        // Store with noon-UTC timestamp of the requested date (idempotent slot)
        var noonOfDate = date.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        Weather snapshot = new Weather(
                fetched.city(), fetched.country(),
                fetched.latitude(), fetched.longitude(),
                fetched.temperature(), fetched.feelsLike(),
                fetched.humidity(), fetched.pressure(),
                fetched.windSpeed(), fetched.windDirection(),
                fetched.description(), fetched.icon(),
                fetched.uvIndex(), fetched.rainfall(),
                fetched.dewPoint(), fetched.radiation(),
                noonOfDate
        );
        repository.save(snapshot);
        return snapshot;
    }
}
