package com.portfolio.weatherapi.adapter.in.web.mapper;

import com.portfolio.weatherapi.application.dto.*;
import com.portfolio.weatherapi.domain.model.CityWindData;
import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.model.Weather;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WeatherMapper {

    public CurrentWeatherResponse toResponse(Weather weather) {
        return new CurrentWeatherResponse(
                weather.city(),
                weather.country(),
                weather.latitude(),
                weather.longitude(),
                weather.temperature(),
                weather.feelsLike(),
                weather.humidity(),
                weather.pressure(),
                weather.windSpeed(),
                weather.windDirection(),
                weather.description(),
                weather.icon(),
                weather.uvIndex(),
                weather.rainfall(),
                weather.timestamp()
        );
    }

    public ForecastResponse toResponse(Forecast forecast) {
        List<ForecastDayResponse> days = forecast.days().stream()
                .map(day -> new ForecastDayResponse(
                        day.date(),
                        day.tempMin(),
                        day.tempMax(),
                        day.humidity(),
                        day.description(),
                        day.icon(),
                        day.rainfall()
                ))
                .toList();
        return new ForecastResponse(forecast.city(), forecast.country(), days);
    }

    public WeatherHistoryResponse toHistoryResponse(Page<Weather> page) {
        List<CurrentWeatherResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return new WeatherHistoryResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public SensorDataResponse toSensorDataResponse(String city, List<Weather> data) {
        List<SensorPointResponse> points = data.stream()
                .map(w -> new SensorPointResponse(
                        w.timestamp(),
                        w.temperature(),
                        w.feelsLike(),
                        w.humidity(),
                        w.pressure(),
                        w.windSpeed(),
                        w.rainfall(),
                        w.uvIndex(),
                        w.dewPoint(),
                        w.radiation()
                ))
                .toList();
        return new SensorDataResponse(city, points, false);
    }

    public SensorDataResponse toSensorDataResponse(String city, List<Weather> data, boolean partial) {
        List<SensorPointResponse> points = data.stream()
                .map(w -> new SensorPointResponse(
                        w.timestamp(),
                        w.temperature(),
                        w.feelsLike(),
                        w.humidity(),
                        w.pressure(),
                        w.windSpeed(),
                        w.rainfall(),
                        w.uvIndex(),
                        w.dewPoint(),
                        w.radiation()
                ))
                .toList();
        return new SensorDataResponse(city, points, partial);
    }

    public CalendarResponse toCalendarResponse(String city, int year, int month,
                                               List<String> daysWithData) {
        return new CalendarResponse(city, year, month, daysWithData);
    }

    public WindFieldResponse toWindFieldResponse(List<CityWindData> data) {
        List<WindFieldResponse.CityWindDto> cities = data.stream()
                .map(c -> new WindFieldResponse.CityWindDto(c.lat(), c.lng(), c.u(), c.v()))
                .toList();

        List<WindFieldResponse.RainZoneDto> rainZones = data.stream()
                .filter(c -> c.rainMmPerHour() >= 0.1)
                .map(c -> {
                    String intensity;
                    if (c.rainMmPerHour() < 2.5) {
                        intensity = "fraca";
                    } else if (c.rainMmPerHour() < 7.5) {
                        intensity = "moderada";
                    } else {
                        intensity = "forte";
                    }
                    return new WindFieldResponse.RainZoneDto(
                            c.lat(), c.lng(), c.name(), c.rainMmPerHour(), intensity);
                })
                .toList();

        return new WindFieldResponse(cities, rainZones);
    }
}
