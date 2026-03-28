package com.portfolio.weatherapi.adapter.out.openweather.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenWeatherForecastResponse(
        List<ForecastItem> list,
        City city
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ForecastItem(
            long dt,
            @JsonProperty("dt_txt") String dtTxt,
            Main main,
            List<WeatherEntry> weather,
            Rain rain,
            Wind wind
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Main(
            double temp,
            @JsonProperty("feels_like") double feelsLike,
            @JsonProperty("temp_min") double tempMin,
            @JsonProperty("temp_max") double tempMax,
            int humidity,
            int pressure
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Wind(double speed, int deg) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WeatherEntry(String description, String icon) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Rain(@JsonProperty("3h") Double threeHour) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record City(String name, String country, Coord coord) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coord(double lat, double lon) {}
}
