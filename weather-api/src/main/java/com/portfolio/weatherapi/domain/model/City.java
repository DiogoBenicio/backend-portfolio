package com.portfolio.weatherapi.domain.model;

public record City(
        String name,
        String country,
        double latitude,
        double longitude
) {}
