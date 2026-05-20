package com.portfolio.weatherapi.adapter.in.web.mapper;

import com.portfolio.weatherapi.application.dto.*;
import com.portfolio.weatherapi.domain.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("WeatherMapper")
class WeatherMapperTest {

    private final WeatherMapper mapper = new WeatherMapper();

    private static Weather weather() {
        return new Weather(
                "São Paulo", "BR",
                -23.5, -46.6,
                28.5, 30.0,
                65, 1013,
                15.0, "NE",
                "céu limpo", "01d",
                3, 0.5,
                18.0, 120.0,
                Instant.parse("2025-05-19T12:00:00Z")
        );
    }

    // ─── toResponse(Weather) ──────────────────────────────────────────────

    @Nested
    @DisplayName("toResponse(Weather)")
    class ToCurrentWeatherResponse {

        @Test
        @DisplayName("deve mapear todos os campos de Weather para CurrentWeatherResponse")
        void shouldMapAllFields() {
            CurrentWeatherResponse res = mapper.toResponse(weather());

            assertThat(res.city()).isEqualTo("São Paulo");
            assertThat(res.country()).isEqualTo("BR");
            assertThat(res.latitude()).isEqualTo(-23.5);
            assertThat(res.longitude()).isEqualTo(-46.6);
            assertThat(res.temperature()).isEqualTo(28.5);
            assertThat(res.feelsLike()).isEqualTo(30.0);
            assertThat(res.humidity()).isEqualTo(65);
            assertThat(res.pressure()).isEqualTo(1013);
            assertThat(res.windSpeed()).isEqualTo(15.0);
            assertThat(res.windDirection()).isEqualTo("NE");
            assertThat(res.description()).isEqualTo("céu limpo");
            assertThat(res.icon()).isEqualTo("01d");
            assertThat(res.uvIndex()).isEqualTo(3);
            assertThat(res.rainfall()).isEqualTo(0.5);
            assertThat(res.timestamp()).isEqualTo(Instant.parse("2025-05-19T12:00:00Z"));
        }
    }

    // ─── toResponse(Forecast) ─────────────────────────────────────────────

    @Nested
    @DisplayName("toResponse(Forecast)")
    class ToForecastResponse {

        @Test
        @DisplayName("deve mapear cidade, país e dias do forecast")
        void shouldMapForecast() {
            List<ForecastDay> days = List.of(
                    new ForecastDay(LocalDate.of(2025, 5, 20), 18.0, 28.0, 60, "nublado", "02d", 0.0),
                    new ForecastDay(LocalDate.of(2025, 5, 21), 16.0, 25.0, 70, "chuva", "10d", 5.0)
            );
            Forecast forecast = new Forecast("Recife", "BR", days);

            ForecastResponse res = mapper.toResponse(forecast);

            assertThat(res.city()).isEqualTo("Recife");
            assertThat(res.country()).isEqualTo("BR");
            assertThat(res.forecast()).hasSize(2);
            assertThat(res.forecast().get(0).date()).isEqualTo(LocalDate.of(2025, 5, 20));
            assertThat(res.forecast().get(0).tempMin()).isEqualTo(18.0);
            assertThat(res.forecast().get(1).rainfall()).isEqualTo(5.0);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando sem dias")
        void shouldHandleEmptyDays() {
            Forecast forecast = new Forecast("Manaus", "BR", List.of());
            ForecastResponse res = mapper.toResponse(forecast);
            assertThat(res.forecast()).isEmpty();
        }
    }

    // ─── toHistoryResponse ────────────────────────────────────────────────

    @Nested
    @DisplayName("toHistoryResponse")
    class ToHistoryResponse {

        @Test
        @DisplayName("deve mapear page com metadados corretos")
        void shouldMapPageMetadata() {
            var page = new PageImpl<>(List.of(weather(), weather()),
                    PageRequest.of(0, 20), 50);

            WeatherHistoryResponse res = mapper.toHistoryResponse(page);

            assertThat(res.content()).hasSize(2);
            assertThat(res.page()).isEqualTo(0);
            assertThat(res.size()).isEqualTo(20);
            assertThat(res.totalElements()).isEqualTo(50);
            assertThat(res.totalPages()).isEqualTo(3);
        }

        @Test
        @DisplayName("deve retornar conteúdo vazio para page vazia")
        void shouldHandleEmptyPage() {
            var page = new PageImpl<Weather>(List.of(), PageRequest.of(0, 20), 0);
            WeatherHistoryResponse res = mapper.toHistoryResponse(page);
            assertThat(res.content()).isEmpty();
            assertThat(res.totalElements()).isEqualTo(0);
        }
    }

    // ─── toSensorDataResponse ─────────────────────────────────────────────

    @Nested
    @DisplayName("toSensorDataResponse")
    class ToSensorDataResponse {

        @Test
        @DisplayName("deve mapear lista de sensores com todos os campos")
        void shouldMapSensorPoints() {
            SensorDataResponse res = mapper.toSensorDataResponse("São Paulo", List.of(weather()));

            assertThat(res.city()).isEqualTo("São Paulo");
            assertThat(res.data()).hasSize(1);
            SensorPointResponse point = res.data().get(0);
            assertThat(point.temperature()).isEqualTo(28.5);
            assertThat(point.humidity()).isEqualTo(65);
            assertThat(point.dewPoint()).isEqualTo(18.0);
            assertThat(point.radiation()).isEqualTo(120.0);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando sem dados")
        void shouldHandleEmptyData() {
            SensorDataResponse res = mapper.toSensorDataResponse("Brasília", List.of());
            assertThat(res.data()).isEmpty();
        }
    }

    // ─── toCalendarResponse ───────────────────────────────────────────────

    @Nested
    @DisplayName("toCalendarResponse")
    class ToCalendarResponse {

        @Test
        @DisplayName("deve mapear city, year, month e daysWithData")
        void shouldMapCalendar() {
            List<String> days = List.of("2025-05-01", "2025-05-15");

            CalendarResponse res = mapper.toCalendarResponse("Fortaleza", 2025, 5, days);

            assertThat(res.city()).isEqualTo("Fortaleza");
            assertThat(res.year()).isEqualTo(2025);
            assertThat(res.month()).isEqualTo(5);
            assertThat(res.daysWithData()).containsExactly("2025-05-01", "2025-05-15");
        }
    }

    // ─── toWindFieldResponse ──────────────────────────────────────────────

    @Nested
    @DisplayName("toWindFieldResponse")
    class ToWindFieldResponse {

        @Test
        @DisplayName("deve separar cidades com chuva como rainZones")
        void shouldClassifyRainZones() {
            List<CityWindData> cities = List.of(
                    new CityWindData("São Paulo", -23.5, -46.6, -1.0, 2.0, 0.0),   // sem chuva
                    new CityWindData("Manaus",    -3.1, -60.0, 0.5, -1.0, 3.0),    // chuva fraca
                    new CityWindData("Belém",     -1.4, -48.5, 0.2, 0.1, 8.0)      // chuva forte
            );

            WindFieldResponse res = mapper.toWindFieldResponse(cities);

            assertThat(res.cities()).hasSize(3);
            assertThat(res.rainZones()).hasSize(2);

            WindFieldResponse.RainZoneDto manaus = res.rainZones().stream()
                    .filter(z -> z.name().equals("Manaus")).findFirst().orElseThrow();
            assertThat(manaus.intensity()).isEqualTo("moderada");

            WindFieldResponse.RainZoneDto belem = res.rainZones().stream()
                    .filter(z -> z.name().equals("Belém")).findFirst().orElseThrow();
            assertThat(belem.intensity()).isEqualTo("forte");
        }

        @Test
        @DisplayName("deve classificar chuva fraca (< 2.5 mm/h)")
        void shouldClassifyLightRain() {
            List<CityWindData> cities = List.of(
                    new CityWindData("Curitiba", -25.4, -49.3, 0.0, 0.0, 1.0)
            );
            WindFieldResponse res = mapper.toWindFieldResponse(cities);
            assertThat(res.rainZones().get(0).intensity()).isEqualTo("fraca");
        }

        @Test
        @DisplayName("deve excluir cidades sem chuva (< 0.1 mm/h) das rainZones")
        void shouldExcludeDryCities() {
            List<CityWindData> cities = List.of(
                    new CityWindData("Porto Alegre", -30.0, -51.2, 1.0, 1.0, 0.0)
            );
            WindFieldResponse res = mapper.toWindFieldResponse(cities);
            assertThat(res.rainZones()).isEmpty();
        }
    }
}
