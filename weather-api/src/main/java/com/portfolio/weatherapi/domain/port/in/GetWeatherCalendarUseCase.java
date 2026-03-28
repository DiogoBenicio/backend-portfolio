package com.portfolio.weatherapi.domain.port.in;

import java.util.List;

public interface GetWeatherCalendarUseCase {
    List<String> execute(String city, int year, int month);
}
