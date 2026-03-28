package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PopulateWeatherService")
class PopulateWeatherServiceTest {

    @Mock
    private WeatherProviderClient providerClient;

    @Mock
    private WeatherDataRepository repository;

    private PopulateWeatherService service;

    private static Weather fetchedWeather() {
        return new Weather("Uberlândia", "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "ensolarado", "01d", 6, 0.0, 0.0, 0.0, Instant.now());
    }

    @BeforeEach
    void setUp() {
        service = new PopulateWeatherService(providerClient, repository);
    }

    @Test
    @DisplayName("deve buscar clima atual e salvar com timestamp noon da data solicitada")
    void shouldSaveWithNoonTimestampOfRequestedDate() {
        LocalDate date = LocalDate.of(2025, 3, 15);
        Instant expectedTimestamp = date.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        when(providerClient.fetchCurrentWeather("Uberlândia", null)).thenReturn(fetchedWeather());

        service.execute("Uberlândia", date);

        ArgumentCaptor<Weather> captor = ArgumentCaptor.forClass(Weather.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().timestamp()).isEqualTo(expectedTimestamp);
    }

    @Test
    @DisplayName("deve preservar todos os dados climáticos do provedor")
    void shouldPreserveWeatherDataFromProvider() {
        Weather fetched = fetchedWeather();
        when(providerClient.fetchCurrentWeather("Uberlândia", null)).thenReturn(fetched);

        Weather result = service.execute("Uberlândia", LocalDate.of(2025, 1, 1));

        assertThat(result.city()).isEqualTo(fetched.city());
        assertThat(result.temperature()).isEqualTo(fetched.temperature());
        assertThat(result.humidity()).isEqualTo(fetched.humidity());
        assertThat(result.pressure()).isEqualTo(fetched.pressure());
    }

    @Test
    @DisplayName("deve chamar o provedor com country null")
    void shouldCallProviderWithNullCountry() {
        when(providerClient.fetchCurrentWeather("São Paulo", null)).thenReturn(fetchedWeather());

        service.execute("São Paulo", LocalDate.now());

        verify(providerClient).fetchCurrentWeather("São Paulo", null);
    }

    @Test
    @DisplayName("timestamp deve ser sempre 12:00:00 UTC independente da data")
    void timestampShouldAlwaysBeNoonUtc() {
        when(providerClient.fetchCurrentWeather(anyString(), any())).thenReturn(fetchedWeather());

        LocalDate[] dates = {
            LocalDate.of(2024, 2, 29), // leap year
            LocalDate.of(2025, 1, 1),
            LocalDate.of(2025, 12, 31),
        };

        for (LocalDate date : dates) {
            service.execute("Uberlândia", date);
        }

        ArgumentCaptor<Weather> captor = ArgumentCaptor.forClass(Weather.class);
        verify(repository, times(3)).save(captor.capture());

        captor.getAllValues().forEach(w -> {
            var zdt = w.timestamp().atZone(ZoneOffset.UTC);
            assertThat(zdt.getHour()).isEqualTo(12);
            assertThat(zdt.getMinute()).isZero();
            assertThat(zdt.getSecond()).isZero();
        });
    }
}
