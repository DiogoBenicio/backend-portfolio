package com.portfolio.weatherapi.application.dto;

import java.util.List;

public record WindFieldResponse(
        List<CityWindDto> cities,
        List<RainZoneDto> rainZones
) {
    public record CityWindDto(double lat, double lng, double u, double v) {}

    public record RainZoneDto(double lat, double lng, String name, double rainMmPerHour, String intensity) {}
}
