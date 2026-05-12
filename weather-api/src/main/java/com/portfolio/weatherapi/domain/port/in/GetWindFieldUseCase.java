package com.portfolio.weatherapi.domain.port.in;

import com.portfolio.weatherapi.domain.model.CityWindData;

import java.util.List;

public interface GetWindFieldUseCase {
    List<CityWindData> execute();
}
