package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Weather;

public interface RefreshWeatherUseCase {
    Weather execute(String city);
}
