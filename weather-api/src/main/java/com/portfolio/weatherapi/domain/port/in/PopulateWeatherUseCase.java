package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Weather;

import java.time.LocalDate;

public interface PopulateWeatherUseCase {
    Weather execute(String city, LocalDate date);
}
