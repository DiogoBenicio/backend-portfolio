package com.portfolio.weatherapi.domain.port.out;

import com.portfolio.weatherapi.domain.model.Weather;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface WeatherDataRepository {
    void save(Weather weather);
    Page<Weather> findByCity(String city, Instant from, Instant to, Pageable pageable);
    List<Weather> findSensorData(String city, Instant from, Instant to);
    List<String> findDaysWithData(String city, int year, int month);
    List<String> findDistinctCities();
}
