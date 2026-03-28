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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshWeatherService")
class RefreshWeatherServiceTest {

    @Mock
    private WeatherProviderClient providerClient;

    @Mock
    private WeatherDataRepository repository;

    private RefreshWeatherService service;

    private static Weather weather(String city) {
        return new Weather(city, null, -15.0, -47.0,
                27.0, 28.0, 55, 1010, 12.0, "E",
                "parcialmente nublado", "02d", 6, 0.0, 0.0, 0.0, Instant.now());
    }

    @BeforeEach
    void setUp() {
        service = new RefreshWeatherService(providerClient, repository);
    }

    @Test
    @DisplayName("deve chamar provedor com country null e retornar o clima atualizado")
    void shouldFetchWithNullCountryAndReturn() {
        Weather expected = weather("Manaus");
        when(providerClient.fetchCurrentWeather("Manaus", null)).thenReturn(expected);

        Weather result = service.execute("Manaus");

        assertThat(result).isEqualTo(expected);
        verify(providerClient).fetchCurrentWeather("Manaus", null);
    }

    @Test
    @DisplayName("deve salvar o clima atualizado no repositório")
    void shouldPersistWeatherInRepository() {
        Weather weather = weather("Belém");
        when(providerClient.fetchCurrentWeather("Belém", null)).thenReturn(weather);

        service.execute("Belém");

        verify(repository, times(1)).save(weather);
    }

    @Test
    @DisplayName("deve propagar exceção quando provedor falhar")
    void shouldPropagateExceptionWhenProviderFails() {
        when(providerClient.fetchCurrentWeather("Natal", null))
                .thenThrow(new RuntimeException("OpenWeather indisponível"));

        assertThatThrownBy(() -> service.execute("Natal"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("OpenWeather indisponível");

        verifyNoInteractions(repository);
    }
}
