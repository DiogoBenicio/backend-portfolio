package com.portfolio.weatherapi.adapter.out.postgres;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "weather_data", indexes = {
        @Index(name = "idx_weather_city_timestamp", columnList = "city, timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    private double latitude;
    private double longitude;
    private double temperature;
    private double feelsLike;
    private int humidity;
    private int pressure;
    private double windSpeed;
    private String windDirection;
    private String description;
    private String icon;
    private int uvIndex;
    private double rainfall;
    private double dewPoint;
    private double radiation;

    @Column(nullable = false)
    private Instant timestamp;
}
