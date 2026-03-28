package com.portfolio.weatherapi.application.dto;

import java.time.Instant;

public record SensorPointResponse(
        Instant timestamp,
        double temperature,
        double feelsLike,
        int humidity,
        int pressure,
        double windSpeed,
        double rainfall,
        int uvIndex,
        double dewPoint,
        double radiation
) {}
