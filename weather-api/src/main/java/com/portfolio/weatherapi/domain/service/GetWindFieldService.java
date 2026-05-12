package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.CityWindData;
import com.portfolio.weatherapi.domain.port.in.GetWindFieldUseCase;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;

import java.util.List;

public class GetWindFieldService implements GetWindFieldUseCase {

    private static final List<String> CITIES = List.of(
            "Uberlândia,BR", "Sao Paulo,BR", "Rio de Janeiro,BR", "Brasilia,BR",
            "Belo Horizonte,BR", "Salvador,BR", "Fortaleza,BR", "Manaus,BR",
            "Porto Alegre,BR", "Recife,BR", "Curitiba,BR", "Goiania,BR"
    );

    private final WeatherProviderClient client;

    public GetWindFieldService(WeatherProviderClient client) {
        this.client = client;
    }

    @Override
    public List<CityWindData> execute() {
        return client.fetchWindFieldData(CITIES);
    }
}
