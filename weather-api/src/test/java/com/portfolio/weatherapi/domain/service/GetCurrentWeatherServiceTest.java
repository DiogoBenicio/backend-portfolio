package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetCurrentWeatherService")
class GetCurrentWeatherServiceTest {

    @Mock
    private WeatherProviderClient providerClient;

    @Mock
    private WeatherDataRepository repository;

    private GetCurrentWeatherService service;

    @BeforeEach
    void setUp() {
        service = new GetCurrentWeatherService(providerClient, repository);
    }

    @Test
    @DisplayName("deve buscar clima, salvar no repositório e retornar o resultado")
    void shouldFetchSaveAndReturn() {
        Weather expected = new Weather("Uberlândia", "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "céu limpo", "01d", 7, 0.0, Instant.now());

        when(providerClient.fetchCurrentWeather("Uberlândia", "BR")).thenReturn(expected);

        Weather result = service.execute("Uberlândia", "BR");

        assertThat(result).isEqualTo(expected);
        verify(repository, times(1)).save(expected);
    }

    @Test
    @DisplayName("deve passar country null para o provedor quando não informado")
    void shouldPassNullCountryToProvider() {
        Weather weather = new Weather("São Paulo", null, -23.5, -46.6,
                22.0, 23.0, 70, 1015, 10.0, "S",
                "nublado", "04d", 3, 0.5, Instant.now());
        when(providerClient.fetchCurrentWeather("São Paulo", null)).thenReturn(weather);

        service.execute("São Paulo", null);

        verify(providerClient).fetchCurrentWeather("São Paulo", null);
    }
}
