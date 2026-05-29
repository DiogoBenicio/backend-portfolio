package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.SensorsResult;

import java.time.Instant;

public interface GetWeatherSensorsUseCase {
    SensorsResult execute(String city, Instant from, Instant to);
}
