package com.portfolio.weatherapi.domain.model;

import java.util.List;

/**
 * Result of the sensors use case, including a {@code partial} flag
 * that is {@code true} when a gap-fill attempt failed and the returned
 * data may be incomplete.
 */
public record SensorsResult(List<Weather> data, boolean partial) {}
