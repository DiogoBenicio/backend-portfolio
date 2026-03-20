package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.Weather;
import org.springframework.data.domain.Page;

import java.time.Instant;

public interface GetWeatherHistoryUseCase {
    Page<Weather> execute(String city, Instant from, Instant to, int page, int size);
}
