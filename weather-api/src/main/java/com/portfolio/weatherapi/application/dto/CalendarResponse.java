package com.portfolio.weatherapi.application.dto;

import java.util.List;

public record CalendarResponse(
        String city,
        int year,
        int month,
        List<String> daysWithData
) {}
