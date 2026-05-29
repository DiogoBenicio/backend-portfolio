package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.CityWindData;
import com.portfolio.weatherapi.domain.port.in.GetWindFieldUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

public class GetWindFieldService implements GetWindFieldUseCase {

    private static final List<String> CITIES = List.of(
            "Uberlândia,BR", "Sao Paulo,BR", "Rio de Janeiro,BR", "Brasilia,BR",
            "Belo Horizonte,BR", "Salvador,BR", "Fortaleza,BR", "Manaus,BR",
            "Porto Alegre,BR", "Recife,BR", "Curitiba,BR", "Goiania,BR"
    );

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final WeatherProviderClient client;

    private volatile List<CityWindData> cachedResult;
    private volatile Instant cachedAt;

    public GetWindFieldService(WeatherProviderClient client) {
        this.client = client;
    }

    @Override
    public List<CityWindData> execute() {
        if (cachedResult != null && cachedAt != null
                && Duration.between(cachedAt, Instant.now()).compareTo(CACHE_TTL) < 0) {
            return cachedResult;
        }
        cachedResult = client.fetchWindFieldData(CITIES);
        cachedAt = Instant.now();
        return cachedResult;
    }
}
