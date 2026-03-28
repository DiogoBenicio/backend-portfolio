package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetWeatherSensorsService")
class GetWeatherSensorsServiceTest {

    @Mock private WeatherDataRepository repository;
    @Mock private WeatherProviderClient weatherProvider;
    @Mock private HistoricalWeatherClient historicalClient;

    private GetWeatherSensorsService service;

    private static Weather weather(String city, Instant timestamp) {
        return new Weather(city, "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "céu limpo", "01d", 0, 0.0, 0.0, 0.0, timestamp);
    }

    @BeforeEach
    void setUp() {
        service = new GetWeatherSensorsService(repository, weatherProvider, historicalClient);
    }

    @Test
    @DisplayName("deve retornar dados existentes sem chamar provider quando não há gaps")
    void shouldReturnExistingDataWhenNoGaps() {
        Instant from = Instant.now().truncatedTo(ChronoUnit.HOURS).minus(1, ChronoUnit.HOURS);
        Instant to   = Instant.now().truncatedTo(ChronoUnit.HOURS);
        List<Weather> existing = List.of(
                weather("Uberlândia", from),
                weather("Uberlândia", to)
        );
        when(repository.findSensorData("Uberlândia", from, to)).thenReturn(existing);

        List<Weather> result = service.execute("Uberlândia", from, to);

        assertThat(result).hasSize(2);
        verify(historicalClient, never()).fetchHistoricalHourly(any(), anyDouble(), anyDouble(), any(), any());
    }

    @Test
    @DisplayName("deve chamar Open-Meteo e salvar pontos quando há gaps")
    void shouldFetchAndSaveHistoricalWhenGapsExist() {
        Instant from = Instant.now().truncatedTo(ChronoUnit.HOURS).minus(2, ChronoUnit.HOURS);
        Instant to   = Instant.now().truncatedTo(ChronoUnit.HOURS);

        List<Weather> filled = List.of(
                weather("Uberlândia", from),
                weather("Uberlândia", from.plus(1, ChronoUnit.HOURS)),
                weather("Uberlândia", to)
        );
        when(repository.findSensorData("Uberlândia", from, to))
                .thenReturn(List.of())
                .thenReturn(filled);

        List<Weather> historical = List.of(
                weather("Uberlândia", from),
                weather("Uberlândia", from.plus(1, ChronoUnit.HOURS)),
                weather("Uberlândia", to)
        );
        // Como não há dados no ES, o service busca coordenadas via weatherProvider
        when(weatherProvider.fetchCurrentWeather("Uberlândia", null))
                .thenReturn(weather("Uberlândia", Instant.now()));
        when(historicalClient.fetchHistoricalHourly(eq("Uberlândia"), anyDouble(), anyDouble(), any(), any()))
                .thenReturn(historical);

        List<Weather> result = service.execute("Uberlândia", from, to);

        assertThat(result).hasSize(3);
        verify(historicalClient, times(1)).fetchHistoricalHourly(eq("Uberlândia"), anyDouble(), anyDouble(), any(), any());
        verify(repository, times(3)).save(any());
    }

    @Test
    @DisplayName("deve retornar lista vazia quando Open-Meteo falha e não há dados no ES")
    void shouldReturnEmptyWhenHistoricalClientFails() {
        Instant from = Instant.now().truncatedTo(ChronoUnit.HOURS).minus(1, ChronoUnit.HOURS);
        Instant to   = Instant.now().truncatedTo(ChronoUnit.HOURS);

        when(repository.findSensorData(anyString(), any(), any())).thenReturn(List.of());
        when(weatherProvider.fetchCurrentWeather(anyString(), any()))
                .thenReturn(weather("CidadeVazia", Instant.now()));
        when(historicalClient.fetchHistoricalHourly(anyString(), anyDouble(), anyDouble(), any(), any()))
                .thenThrow(new RuntimeException("Open-Meteo indisponível"));

        List<Weather> result = service.execute("CidadeVazia", from, to);

        assertThat(result).isEmpty();
        verify(repository, never()).save(any());
    }
}
