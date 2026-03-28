package com.portfolio.weatherapi.application.dto;

import java.util.List;

public record SensorDataResponse(
        String city,
        List<SensorPointResponse> data
) {}
