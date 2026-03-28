package com.portfolio.weatherapi.adapter.in.web;

import com.portfolio.weatherapi.adapter.in.web.mapper.WeatherMapper;
import com.portfolio.weatherapi.application.dto.*;
import com.portfolio.weatherapi.domain.port.in.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/weather")
@Validated
@Tag(name = "Weather", description = "Endpoints para consulta de dados meteorológicos")
public class WeatherController {

    private static final Duration MAX_SENSOR_RANGE = Duration.ofDays(7);

    private final GetCurrentWeatherUseCase getCurrentWeather;
    private final GetForecastUseCase getForecast;
    private final GetWeatherHistoryUseCase getWeatherHistory;
    private final RefreshWeatherUseCase refreshWeather;
    private final GetWeatherSensorsUseCase getWeatherSensors;
    private final GetWeatherCalendarUseCase getWeatherCalendar;
    private final PopulateWeatherUseCase populateWeather;
    private final WeatherMapper mapper;

    public WeatherController(
            GetCurrentWeatherUseCase getCurrentWeather,
            GetForecastUseCase getForecast,
            GetWeatherHistoryUseCase getWeatherHistory,
            RefreshWeatherUseCase refreshWeather,
            GetWeatherSensorsUseCase getWeatherSensors,
            GetWeatherCalendarUseCase getWeatherCalendar,
            PopulateWeatherUseCase populateWeather,
            WeatherMapper mapper
    ) {
        this.getCurrentWeather = getCurrentWeather;
        this.getForecast = getForecast;
        this.getWeatherHistory = getWeatherHistory;
        this.refreshWeather = refreshWeather;
        this.getWeatherSensors = getWeatherSensors;
        this.getWeatherCalendar = getWeatherCalendar;
        this.populateWeather = populateWeather;
        this.mapper = mapper;
    }

    // ─── city param validation ────────────────────────────────────────────────

    private static final String CITY_PATTERN = "[a-zA-ZÀ-ÿ0-9 ,.'\\-]+";
    private static final int CITY_MAX = 100;

    // ─── existing endpoints ───────────────────────────────────────────────────

    @GetMapping("/current")
    @Operation(summary = "Clima atual")
    public ResponseEntity<CurrentWeatherResponse> getCurrent(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam(required = false) String country
    ) {
        return ResponseEntity.ok(mapper.toResponse(getCurrentWeather.execute(city.trim(), country)));
    }

    @GetMapping("/forecast")
    @Operation(summary = "Previsão do tempo")
    public ResponseEntity<ForecastResponse> getForecast(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(5) int days
    ) {
        return ResponseEntity.ok(mapper.toResponse(getForecast.execute(city.trim(), days)));
    }

    @GetMapping("/history")
    @Operation(summary = "Histórico de clima")
    public ResponseEntity<WeatherHistoryResponse> getHistory(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        Instant resolvedFrom = from != null ? from : Instant.now().minusSeconds(86400 * 7);
        Instant resolvedTo   = to   != null ? to   : Instant.now();
        return ResponseEntity.ok(mapper.toHistoryResponse(
                getWeatherHistory.execute(city.trim(), resolvedFrom, resolvedTo, page, size)
        ));
    }

    @GetMapping("/cities")
    @Operation(summary = "Cidades com dados")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Forçar atualização")
    public ResponseEntity<CurrentWeatherResponse> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        return ResponseEntity.ok(mapper.toResponse(refreshWeather.execute(request.city())));
    }

    // ─── new endpoints ────────────────────────────────────────────────────────

    @GetMapping("/sensors")
    @Operation(summary = "Série temporal de sensores",
               description = "Retorna dados de todos os sensores em série temporal. Janela máxima: 7 dias.")
    public ResponseEntity<SensorDataResponse> getSensors(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        if (Duration.between(from, to).compareTo(MAX_SENSOR_RANGE) > 0) {
            throw new IllegalArgumentException(
                    "Janela de consulta não pode exceder 7 dias. Reduza o intervalo entre 'from' e 'to'.");
        }
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' deve ser anterior a 'to'.");
        }
        var data = getWeatherSensors.execute(city.trim(), from, to);
        return ResponseEntity.ok(mapper.toSensorDataResponse(city.trim(), data));
    }

    @GetMapping("/calendar")
    @Operation(summary = "Calendário de dados",
               description = "Retorna quais dias do mês possuem dados no Elasticsearch.")
    public ResponseEntity<CalendarResponse> getCalendar(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam @Min(2020) @Max(2100) int year,
            @RequestParam @Min(1) @Max(12) int month
    ) {
        var days = getWeatherCalendar.execute(city.trim(), year, month);
        return ResponseEntity.ok(mapper.toCalendarResponse(city.trim(), year, month, days));
    }

    @PostMapping("/populate")
    @Operation(summary = "Popular dados de uma data",
               description = "Busca clima atual e persiste com o timestamp da data solicitada (snapshot).")
    public ResponseEntity<CurrentWeatherResponse> populate(
            @RequestParam @NotBlank @Size(max = CITY_MAX) @Pattern(regexp = CITY_PATTERN) String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (date.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Não é possível popular dados para datas futuras.");
        }
        var weather = populateWeather.execute(city.trim(), date);
        return ResponseEntity.ok(mapper.toResponse(weather));
    }
}
