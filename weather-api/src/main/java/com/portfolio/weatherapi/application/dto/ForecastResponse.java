package com.portfolio.weatherapi.application.dto;

import java.util.List;

public record ForecastResponse(
        String city,
        String country,
        List<ForecastDayResponse> forecast
) {}
