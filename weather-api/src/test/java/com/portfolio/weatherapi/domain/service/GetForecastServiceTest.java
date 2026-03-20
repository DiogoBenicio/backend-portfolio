package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Forecast;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetForecastService")
class GetForecastServiceTest {

    @Mock
    private WeatherProviderClient providerClient;

    private GetForecastService service;

    @BeforeEach
    void setUp() {
        service = new GetForecastService(providerClient);
    }

    @Test
    @DisplayName("deve limitar o número de dias a 5")
    void shouldClampDaysToMax5() {
        Forecast forecast = new Forecast("Recife", "BR", List.of());
        when(providerClient.fetchForecast("Recife", 5)).thenReturn(forecast);

        service.execute("Recife", 10);

        verify(providerClient).fetchForecast("Recife", 5);
    }

    @Test
    @DisplayName("deve limitar o número de dias a mínimo 1")
    void shouldClampDaysToMin1() {
        Forecast forecast = new Forecast("Recife", "BR", List.of());
        when(providerClient.fetchForecast("Recife", 1)).thenReturn(forecast);

        service.execute("Recife", 0);

        verify(providerClient).fetchForecast("Recife", 1);
    }

    @Test
    @DisplayName("deve retornar previsão do provedor")
    void shouldReturnForecastFromProvider() {
        Forecast expected = new Forecast("Recife", "BR", List.of());
        when(providerClient.fetchForecast("Recife", 3)).thenReturn(expected);

        Forecast result = service.execute("Recife", 3);

        assertThat(result).isEqualTo(expected);
    }
}
