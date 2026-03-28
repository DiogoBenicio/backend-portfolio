package com.portfolio.weatherapi.domain.port.out;

import com.portfolio.weatherapi.domain.model.Weather;

import java.time.Instant;
import java.util.List;

public interface HistoricalWeatherClient {

    /**
     * Busca dados históricos horários para uma cidade entre dois instantes.
     * A implementação é responsável por converter cidade → coordenadas e
     * chamar a fonte de dados históricos (ex: Open-Meteo).
     */
    List<Weather> fetchHistoricalHourly(String city, double latitude, double longitude,
                                        Instant from, Instant to);
}
