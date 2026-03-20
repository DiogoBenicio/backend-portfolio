package com.portfolio.weatherapi.application.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "O campo 'city' é obrigatório") String city
) {}
