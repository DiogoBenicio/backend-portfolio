package com.portfolio.weatherapi.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Dados do clima atual para uma cidade")
public record CurrentWeatherResponse(
        @Schema(description = "Nome da cidade") String city,
        @Schema(description = "Código do país (ex: BR)") String country,
        @Schema(description = "Latitude") double latitude,
        @Schema(description = "Longitude") double longitude,
        @Schema(description = "Temperatura em °C") double temperature,
        @Schema(description = "Sensação térmica em °C") double feelsLike,
        @Schema(description = "Umidade relativa (%)") int humidity,
        @Schema(description = "Pressão atmosférica (hPa)") int pressure,
        @Schema(description = "Velocidade do vento (km/h)") double windSpeed,
        @Schema(description = "Direção do vento") String windDirection,
        @Schema(description = "Descrição do clima") String description,
        @Schema(description = "Código do ícone OpenWeather") String icon,
        @Schema(description = "Índice UV") int uvIndex,
        @Schema(description = "Chuva acumulada (mm/1h)") double rainfall,
        @Schema(description = "Timestamp da medição") @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC") Instant timestamp
) {}
