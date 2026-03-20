package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Weather;

public interface GetCurrentWeatherUseCase {
    Weather execute(String city, String country);
}
