package com.portfolio.weatherapi.adapter.out.postgres;

import com.portfolio.weatherapi.domain.model.Weather;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostgresWeatherAdapter")
class PostgresWeatherAdapterTest {

    @Mock
    private WeatherJpaRepository repository;

    private PostgresWeatherAdapter adapter;

    private static Weather weather(String city, Instant timestamp) {
        return new Weather(city, "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "ensolarado", "01d", 5, 0.0, 0.0, 0.0, timestamp);
    }

    @BeforeEach
    void setUp() {
        adapter = new PostgresWeatherAdapter(repository);
    }

    // ─── save ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("save()")
    class SaveTests {

        @Test
        @SuppressWarnings("null")
        @DisplayName("ID deve ser determinístico: city-slug + YYYY-MM-DD-HH")
        void shouldGenerateDeterministicId() {
            Instant ts = Instant.parse("2025-03-15T14:30:00Z");
            adapter.save(weather("São Paulo", ts));

            ArgumentCaptor<WeatherEntity> captor = ArgumentCaptor.forClass(WeatherEntity.class);
            verify(repository).save(captor.capture());
            assertThat(captor.getValue().getId()).isEqualTo("s-o-paulo-2025-03-15-14");
        }

        @Test
        @SuppressWarnings("null")
        @DisplayName("dois saves na mesma hora geram o mesmo ID (upsert idempotente)")
        void shouldProduceSameIdForSameHour() {
            Instant t1 = Instant.parse("2025-03-15T14:05:00Z");
            Instant t2 = Instant.parse("2025-03-15T14:55:00Z");

            adapter.save(weather("Recife", t1));
            adapter.save(weather("Recife", t2));

            ArgumentCaptor<WeatherEntity> captor = ArgumentCaptor.forClass(WeatherEntity.class);
            verify(repository, times(2)).save(captor.capture());
            List<String> ids = captor.getAllValues().stream().map(WeatherEntity::getId).toList();
            assertThat(ids.get(0)).isEqualTo(ids.get(1));
        }

        @Test
        @SuppressWarnings("null")
        @DisplayName("saves em horas diferentes geram IDs diferentes")
        void shouldProduceDifferentIdsForDifferentHours() {
            Instant t1 = Instant.parse("2025-03-15T13:00:00Z");
            Instant t2 = Instant.parse("2025-03-15T14:00:00Z");

            adapter.save(weather("Recife", t1));
            adapter.save(weather("Recife", t2));

            ArgumentCaptor<WeatherEntity> captor = ArgumentCaptor.forClass(WeatherEntity.class);
            verify(repository, times(2)).save(captor.capture());
            List<String> ids = captor.getAllValues().stream().map(WeatherEntity::getId).toList();
            assertThat(ids.get(0)).isNotEqualTo(ids.get(1));
        }

        @Test
        @SuppressWarnings("null")
        @DisplayName("deve mapear todos os campos corretamente")
        void shouldMapAllFields() {
            Instant ts = Instant.parse("2025-03-15T10:00:00Z");
            adapter.save(weather("Uberlândia", ts));

            ArgumentCaptor<WeatherEntity> captor = ArgumentCaptor.forClass(WeatherEntity.class);
            verify(repository).save(captor.capture());
            WeatherEntity e = captor.getValue();
            assertThat(e.getCity()).isEqualTo("Uberlândia");
            assertThat(e.getTemperature()).isEqualTo(28.5);
            assertThat(e.getTimestamp()).isEqualTo(ts);
        }
    }

    // ─── findSensorData ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("findSensorData()")
    class FindSensorDataTests {

        @Test
        @DisplayName("deve mapear WeatherEntity para Weather corretamente")
        void shouldMapEntityToModel() {
            Instant ts = Instant.parse("2025-03-10T12:00:00Z");
            WeatherEntity entity = WeatherEntity.builder()
                    .id("uberlandia-2025-03-10-12")
                    .city("Uberlândia").country("BR")
                    .latitude(-18.9).longitude(-48.3)
                    .temperature(28.5).feelsLike(30.1)
                    .humidity(60).pressure(1012)
                    .windSpeed(15.0).windDirection("NE")
                    .description("ensolarado").icon("01d")
                    .uvIndex(5).rainfall(0.0).dewPoint(0.0).radiation(0.0)
                    .timestamp(ts)
                    .build();

            when(repository.findTop500ByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThanOrderByTimestampAsc(
                    anyString(), any(), any())).thenReturn(List.of(entity));

            List<Weather> result = adapter.findSensorData("Uberlândia",
                    Instant.parse("2025-03-01T00:00:00Z"), Instant.parse("2025-03-31T23:59:59Z"));

            assertThat(result).hasSize(1);
            Weather w = result.get(0);
            assertThat(w.city()).isEqualTo("Uberlândia");
            assertThat(w.temperature()).isEqualTo(28.5);
            assertThat(w.timestamp()).isEqualTo(ts);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando não há dados")
        void shouldReturnEmptyWhenNoData() {
            when(repository.findTop500ByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThanOrderByTimestampAsc(
                    anyString(), any(), any())).thenReturn(List.of());

            List<Weather> result = adapter.findSensorData("Fortaleza",
                    Instant.parse("2025-03-01T00:00:00Z"), Instant.parse("2025-03-31T23:59:59Z"));

            assertThat(result).isEmpty();
        }
    }

    // ─── findDaysWithData ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("findDaysWithData()")
    class FindDaysWithDataTests {

        @Test
        @DisplayName("deve retornar dias distintos delegando ao repositório")
        void shouldReturnDistinctDays() {
            when(repository.findDaysWithData(anyString(), any(), any()))
                    .thenReturn(List.of("2025-03-05", "2025-03-20"));

            List<String> result = adapter.findDaysWithData("Uberlândia", 2025, 3);

            assertThat(result).containsExactly("2025-03-05", "2025-03-20");
        }

        @Test
        @DisplayName("deve retornar lista vazia quando não há dados no mês")
        void shouldReturnEmptyWhenNoData() {
            when(repository.findDaysWithData(anyString(), any(), any()))
                    .thenReturn(List.of());

            List<String> result = adapter.findDaysWithData("Uberlândia", 2025, 3);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("deve calcular o range correto para o mês")
        void shouldPassCorrectMonthRange() {
            when(repository.findDaysWithData(anyString(), any(), any())).thenReturn(List.of());

            adapter.findDaysWithData("Recife", 2025, 3);

            ArgumentCaptor<Instant> fromCaptor = ArgumentCaptor.forClass(Instant.class);
            ArgumentCaptor<Instant> toCaptor   = ArgumentCaptor.forClass(Instant.class);
            verify(repository).findDaysWithData(eq("Recife"), fromCaptor.capture(), toCaptor.capture());

            assertThat(fromCaptor.getValue()).isEqualTo(Instant.parse("2025-03-01T00:00:00Z"));
            assertThat(toCaptor.getValue()).isEqualTo(Instant.parse("2025-04-01T00:00:00Z"));
        }
    }

    // ─── findByCity ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("findByCity()")
    class FindByCityTests {

        @Test
        @SuppressWarnings("null")
        @DisplayName("deve retornar página vazia quando não há dados")
        void shouldReturnEmptyPage() {
            when(repository.findByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThan(anyString(), any(), any(), any()))
                    .thenReturn(new PageImpl<>(List.<WeatherEntity>of()));

            var result = adapter.findByCity("Manaus",
                    Instant.parse("2025-03-01T00:00:00Z"),
                    Instant.parse("2025-03-31T23:59:59Z"),
                    PageRequest.of(0, 10));

            assertThat(result.getContent()).isEmpty();
        }
    }
}
