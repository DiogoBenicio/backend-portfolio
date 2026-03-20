package com.portfolio.weatherapi.adapter.out.openweather.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenWeatherCurrentResponse(
        String name,
        Sys sys,
        Coord coord,
        List<WeatherEntry> weather,
        Main main,
        Wind wind,
        Rain rain,
        long dt
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coord(double lat, double lon) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WeatherEntry(String description, String icon) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Main(
            double temp,
            @JsonProperty("feels_like") double feelsLike,
            int humidity,
            int pressure
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Wind(double speed, int deg) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Rain(@JsonProperty("1h") Double oneHour) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Sys(String country) {}
}
