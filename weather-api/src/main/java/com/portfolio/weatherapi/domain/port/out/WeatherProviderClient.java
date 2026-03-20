package com.portfolio.weatherapi.domain.port.out;

import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.model.Weather;

public interface WeatherProviderClient {
    Weather fetchCurrentWeather(String city, String country);
    Forecast fetchForecast(String city, int days);
}
