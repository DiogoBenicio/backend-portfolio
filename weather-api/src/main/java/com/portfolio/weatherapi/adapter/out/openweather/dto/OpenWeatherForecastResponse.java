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
            @JsonProperty("dt_txt") String dtTxt,
            Main main,
            List<WeatherEntry> weather,
            Rain rain
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Main(
            double temp,
            @JsonProperty("temp_min") double tempMin,
            @JsonProperty("temp_max") double tempMax,
            int humidity
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WeatherEntry(String description, String icon) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Rain(@JsonProperty("3h") Double threeHour) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record City(String name, String country) {}
}
