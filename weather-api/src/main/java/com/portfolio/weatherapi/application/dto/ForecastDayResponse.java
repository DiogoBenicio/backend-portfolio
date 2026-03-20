package com.portfolio.weatherapi.application.dto;

import java.time.LocalDate;

public record ForecastDayResponse(
        LocalDate date,
        double tempMin,
        double tempMax,
        int humidity,
        String description,
        String icon,
        double rainfall
) {}
