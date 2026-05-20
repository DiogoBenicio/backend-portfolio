package com.portfolio.weatherapi.domain.port.in;

import java.util.List;

public interface GetDistinctCitiesUseCase {
    List<String> execute();
}
