package com.portfolio.weatherapi.domain.model;

import java.time.Instant;

public record Weather(
        String city,
        String country,
        double latitude,
        double longitude,
        double temperature,
        double feelsLike,
        int humidity,
        int pressure,
        double windSpeed,
        String windDirection,
        String description,
        String icon,
        int uvIndex,
        double rainfall,
        Instant timestamp
) {
    public static Weather of(
            String city, String country,
            double latitude, double longitude,
            double temperature, double feelsLike,
            int humidity, int pressure,
            double windSpeed, String windDirection,
            String description, String icon,
            int uvIndex, double rainfall
    ) {
        return new Weather(city, country, latitude, longitude,
                temperature, feelsLike, humidity, pressure,
                windSpeed, windDirection, description, icon,
                uvIndex, rainfall, Instant.now());
    }
}
