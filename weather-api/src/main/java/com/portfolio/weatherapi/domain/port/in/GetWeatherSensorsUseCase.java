package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Weather;

import java.time.Instant;
import java.util.List;

public interface GetWeatherSensorsUseCase {
    List<Weather> execute(String city, Instant from, Instant to);
}
