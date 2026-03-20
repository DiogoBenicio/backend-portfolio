package com.portfolio.weatherapi.domain.model;

import java.time.LocalDate;

public record ForecastDay(
        LocalDate date,
        double tempMin,
        double tempMax,
        int humidity,
        String description,
        String icon,
        double rainfall
) {}
