package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PopulateWeatherService")
class PopulateWeatherServiceTest {

    @Mock
    private WeatherProviderClient providerClient;

    @Mock
    private HistoricalWeatherClient historicalClient;

    @Mock
    private WeatherDataRepository repository;

    private PopulateWeatherService service;

    private static Weather fetchedWeather() {
        return new Weather("Uberlândia", "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "ensolarado", "01d", 6, 0.0, 0.0, 0.0, Instant.now());
    }

    private static Weather historicalPoint(Instant timestamp) {
        return new Weather("Uberlândia", "BR", -18.9, -48.3,
                22.0, 21.0, 70, 1010, 10.0, "N",
                "nublado", "02d", 0, 0.0, 15.0, 100.0, timestamp);
    }

    @BeforeEach
    void setUp() {
        service = new PopulateWeatherService(providerClient, historicalClient, repository);
    }

    @Test
    @DisplayName("deve buscar clima atual e salvar com timestamp noon da data solicitada")
    void shouldSaveWithNoonTimestampOfRequestedDate() {
        LocalDate date = LocalDate.now(ZoneOffset.UTC); // today → uses current weather
        Instant expectedTimestamp = date.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        when(providerClient.fetchCurrentWeather("Uberlândia", null)).thenReturn(fetchedWeather());

        service.execute("Uberlândia", date);

        ArgumentCaptor<Weather> captor = ArgumentCaptor.forClass(Weather.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().timestamp()).isEqualTo(expectedTimestamp);
    }

    @Test
    @DisplayName("deve preservar todos os dados climáticos do provedor para data atual")
    void shouldPreserveWeatherDataFromProvider() {
        Weather fetched = fetchedWeather();
        when(providerClient.fetchCurrentWeather("Uberlândia", null)).thenReturn(fetched);

        Weather result = service.execute("Uberlândia", LocalDate.now(ZoneOffset.UTC));

        assertThat(result.city()).isEqualTo(fetched.city());
        assertThat(result.temperature()).isEqualTo(fetched.temperature());
        assertThat(result.humidity()).isEqualTo(fetched.humidity());
        assertThat(result.pressure()).isEqualTo(fetched.pressure());
    }

    @Test
    @DisplayName("deve chamar o provedor com country null para data atual")
    void shouldCallProviderWithNullCountry() {
        when(providerClient.fetchCurrentWeather("São Paulo", null)).thenReturn(fetchedWeather());

        service.execute("São Paulo", LocalDate.now(ZoneOffset.UTC));

        verify(providerClient).fetchCurrentWeather("São Paulo", null);
    }

    @Test
    @DisplayName("deve usar historicalClient para datas passadas")
    void shouldUseHistoricalClientForPastDates() {
        LocalDate pastDate = LocalDate.now(ZoneOffset.UTC).minusDays(3);
        Instant noonSlot = pastDate.atTime(LocalTime.NOON).toInstant(ZoneOffset.UTC);
        Weather coords = fetchedWeather();
        Weather point  = historicalPoint(noonSlot);

        when(providerClient.fetchCurrentWeather("Uberlândia", null)).thenReturn(coords);
        when(historicalClient.fetchHistoricalHourly(
                eq("Uberlândia"), anyDouble(), anyDouble(), any(Instant.class), any(Instant.class)))
                .thenReturn(List.of(point));

        Weather result = service.execute("Uberlândia", pastDate);

        verify(historicalClient).fetchHistoricalHourly(
                eq("Uberlândia"), anyDouble(), anyDouble(), any(Instant.class), any(Instant.class));
        verify(repository, atLeastOnce()).save(any(Weather.class));
        assertThat(result.city()).isEqualTo("Uberlândia");
    }

    @Test
    @DisplayName("timestamp deve ser sempre 12:00:00 UTC independente da data (data atual)")
    void timestampShouldAlwaysBeNoonUtc() {
        when(providerClient.fetchCurrentWeather(anyString(), any())).thenReturn(fetchedWeather());

        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        service.execute("Uberlândia", today);

        ArgumentCaptor<Weather> captor = ArgumentCaptor.forClass(Weather.class);
        verify(repository).save(captor.capture());

        var zdt = captor.getValue().timestamp().atZone(ZoneOffset.UTC);
        assertThat(zdt.getHour()).isEqualTo(12);
        assertThat(zdt.getMinute()).isZero();
        assertThat(zdt.getSecond()).isZero();
    }
}
