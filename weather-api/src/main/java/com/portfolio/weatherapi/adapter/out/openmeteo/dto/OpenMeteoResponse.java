package com.portfolio.weatherapi.adapter.out.openmeteo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoResponse(
        double latitude,
        double longitude,
        HourlyData hourly
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HourlyData(
            List<String> time,
            @JsonProperty("temperature_2m")           List<Double>  temperature2m,
            @JsonProperty("apparent_temperature")     List<Double>  apparentTemperature,
            @JsonProperty("dew_point_2m")             List<Double>  dewPoint2m,
            @JsonProperty("relative_humidity_2m")     List<Integer> relativeHumidity2m,
            @JsonProperty("surface_pressure")         List<Double>  surfacePressure,
            @JsonProperty("wind_speed_10m")           List<Double>  windSpeed10m,
            @JsonProperty("wind_direction_10m")       List<Integer> windDirection10m,
            List<Double>                                            precipitation,
            @JsonProperty("global_tilted_irradiance") List<Double>  globalTiltedIrradiance,
            @JsonProperty("shortwave_radiation")      List<Double>  shortwaveRadiation
    ) {}
}
