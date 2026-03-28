package com.portfolio.weatherapi.domain.port.out;

import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.model.Weather;
import java.util.List;

public interface WeatherProviderClient {
    Weather fetchCurrentWeather(String city, String country);
    Forecast fetchForecast(String city, int days);
    /** Retorna snapshots individuais de 3h em 3h para os próximos 5 dias (free tier). */
    List<Weather> fetchHourlySnapshots(String city);
}
