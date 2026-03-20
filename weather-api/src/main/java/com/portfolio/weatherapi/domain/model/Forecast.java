package com.portfolio.weatherapi.domain.model;

import java.util.List;

public record Forecast(
        String city,
        String country,
        List<ForecastDay> days
) {}
