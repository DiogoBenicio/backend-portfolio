package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Forecast;

public interface GetForecastUseCase {
    Forecast execute(String city, int days);
}
