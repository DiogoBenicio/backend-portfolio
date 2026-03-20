package com.portfolio.weatherapi.application.dto;

import java.util.List;

public record WeatherHistoryResponse(
        List<CurrentWeatherResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
