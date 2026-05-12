package com.portfolio.weatherapi.domain.model;

public record CityWindData(
        String name,
        double lat,
        double lng,
        double u,
        double v,
        double rainMmPerHour
) {}
