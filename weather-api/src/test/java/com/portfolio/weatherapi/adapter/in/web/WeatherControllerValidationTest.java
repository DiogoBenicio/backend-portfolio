package com.portfolio.weatherapi.adapter.in.web;

import com.portfolio.weatherapi.adapter.in.web.mapper.WeatherMapper;
import com.portfolio.weatherapi.application.dto.CalendarResponse;
import com.portfolio.weatherapi.application.dto.SensorDataResponse;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.in.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WeatherController — validações de negócio")
class WeatherControllerValidationTest {

    @Mock private GetCurrentWeatherUseCase getCurrentWeather;
    @Mock private GetForecastUseCase getForecast;
    @Mock private GetWeatherHistoryUseCase getWeatherHistory;
    @Mock private RefreshWeatherUseCase refreshWeather;
    @Mock private GetWeatherSensorsUseCase getWeatherSensors;
    @Mock private GetWeatherCalendarUseCase getWeatherCalendar;
    @Mock private PopulateWeatherUseCase populateWeather;
    @Mock private WeatherMapper mapper;

    private WeatherController controller;

    private static Weather weather() {
        return new Weather("Uberlândia", "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "ensolarado", "01d", 5, 0.0, 0.0, 0.0, Instant.now());
    }

    @BeforeEach
    void setUp() {
        controller = new WeatherController(
                getCurrentWeather, getForecast, getWeatherHistory,
                refreshWeather, getWeatherSensors, getWeatherCalendar,
                populateWeather, mapper
        );
    }

    // ─── /sensors ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /sensors")
    class SensorsEndpoint {

        @Test
        @DisplayName("deve retornar 200 com range de exatamente 7 dias")
        void shouldAccept7DayRange() {
            Instant from = Instant.parse("2025-03-01T00:00:00Z");
            Instant to   = Instant.parse("2025-03-08T00:00:00Z"); // exatos 7 dias
            when(getWeatherSensors.execute(any(), any(), any())).thenReturn(List.of());
            when(mapper.toSensorDataResponse(any(), any())).thenReturn(new SensorDataResponse("Uberlândia", List.of()));

            ResponseEntity<SensorDataResponse> response = controller.getSensors("Uberlândia", from, to);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
        }

        @Test
        @DisplayName("deve lançar IllegalArgumentException para range acima de 7 dias")
        void shouldRejectRangeAbove7Days() {
            Instant from = Instant.parse("2025-03-01T00:00:00Z");
            Instant to   = Instant.parse("2025-03-09T00:00:01Z"); // 8 dias e 1 segundo

            assertThatThrownBy(() -> controller.getSensors("Uberlândia", from, to))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("7 dias");
        }

        @Test
        @DisplayName("deve lançar IllegalArgumentException quando from > to")
        void shouldRejectFromAfterTo() {
            Instant from = Instant.parse("2025-03-10T00:00:00Z");
            Instant to   = Instant.parse("2025-03-01T00:00:00Z");

            assertThatThrownBy(() -> controller.getSensors("Uberlândia", from, to))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("'from' deve ser anterior");
        }

        @Test
        @DisplayName("deve passar city trimada ao use case")
        void shouldTrimCityBeforePassingToUseCase() {
            Instant from = Instant.parse("2025-03-01T00:00:00Z");
            Instant to   = Instant.parse("2025-03-05T00:00:00Z");
            when(getWeatherSensors.execute(eq("Uberlândia"), any(), any())).thenReturn(List.of());
            when(mapper.toSensorDataResponse(any(), any())).thenReturn(new SensorDataResponse("Uberlândia", List.of()));

            controller.getSensors("  Uberlândia  ", from, to);

            verify(getWeatherSensors).execute(eq("Uberlândia"), any(), any());
        }
    }

    // ─── /calendar ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /calendar")
    class CalendarEndpoint {

        @Test
        @DisplayName("deve retornar 200 com parâmetros válidos")
        void shouldReturn200ForValidParams() {
            when(getWeatherCalendar.execute("Uberlândia", 2025, 3))
                    .thenReturn(List.of("2025-03-01", "2025-03-05"));
            when(mapper.toCalendarResponse(any(), anyInt(), anyInt(), any()))
                    .thenReturn(new CalendarResponse("Uberlândia", 2025, 3, List.of("2025-03-01")));

            ResponseEntity<CalendarResponse> response = controller.getCalendar("Uberlândia", 2025, 3);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(getWeatherCalendar).execute("Uberlândia", 2025, 3);
        }

        @Test
        @DisplayName("deve passar city trimada ao use case")
        void shouldTrimCity() {
            when(getWeatherCalendar.execute(eq("Recife"), anyInt(), anyInt())).thenReturn(List.of());
            when(mapper.toCalendarResponse(any(), anyInt(), anyInt(), any()))
                    .thenReturn(new CalendarResponse("Recife", 2025, 1, List.of()));

            controller.getCalendar("  Recife  ", 2025, 1);

            verify(getWeatherCalendar).execute(eq("Recife"), anyInt(), anyInt());
        }
    }

    // ─── /populate ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /populate")
    class PopulateEndpoint {

        @Test
        @DisplayName("deve retornar 200 para data passada válida")
        void shouldAcceptPastDate() {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            when(populateWeather.execute(eq("Uberlândia"), eq(yesterday))).thenReturn(weather());
            when(mapper.toResponse(any(Weather.class))).thenReturn(null);

            ResponseEntity<?> response = controller.populate("Uberlândia", yesterday);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
        }

        @Test
        @DisplayName("deve aceitar data de hoje")
        void shouldAcceptToday() {
            LocalDate today = LocalDate.now();
            when(populateWeather.execute(eq("Uberlândia"), eq(today))).thenReturn(weather());
            when(mapper.toResponse(any(Weather.class))).thenReturn(null);

            ResponseEntity<?> response = controller.populate("Uberlândia", today);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
        }

        @Test
        @DisplayName("deve lançar IllegalArgumentException para data futura")
        void shouldRejectFutureDate() {
            LocalDate tomorrow = LocalDate.now().plusDays(1);

            assertThatThrownBy(() -> controller.populate("Uberlândia", tomorrow))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("datas futuras");
        }
    }
}
