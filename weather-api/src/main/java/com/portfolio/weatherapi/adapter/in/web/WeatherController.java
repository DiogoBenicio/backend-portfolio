package com.portfolio.weatherapi.adapter.in.web;

import com.portfolio.weatherapi.adapter.in.web.mapper.WeatherMapper;
import com.portfolio.weatherapi.application.dto.*;
import com.portfolio.weatherapi.domain.port.in.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/weather")
@Validated
@Tag(name = "Weather", description = "Endpoints para consulta de dados meteorológicos")
public class WeatherController {

    private final GetCurrentWeatherUseCase getCurrentWeather;
    private final GetForecastUseCase getForecast;
    private final GetWeatherHistoryUseCase getWeatherHistory;
    private final RefreshWeatherUseCase refreshWeather;
    private final WeatherMapper mapper;

    public WeatherController(
            GetCurrentWeatherUseCase getCurrentWeather,
            GetForecastUseCase getForecast,
            GetWeatherHistoryUseCase getWeatherHistory,
            RefreshWeatherUseCase refreshWeather,
            WeatherMapper mapper
    ) {
        this.getCurrentWeather = getCurrentWeather;
        this.getForecast = getForecast;
        this.getWeatherHistory = getWeatherHistory;
        this.refreshWeather = refreshWeather;
        this.mapper = mapper;
    }

    @GetMapping("/current")
    @Operation(summary = "Clima atual", description = "Busca o clima atual de uma cidade na OpenWeather e salva no Elasticsearch")
    public ResponseEntity<CurrentWeatherResponse> getCurrent(
            @Parameter(description = "Nome da cidade", example = "Uberlândia")
            @RequestParam @NotBlank String city,
            @Parameter(description = "Código do país (opcional)", example = "BR")
            @RequestParam(required = false) String country
    ) {
        return ResponseEntity.ok(mapper.toResponse(getCurrentWeather.execute(city, country)));
    }

    @GetMapping("/forecast")
    @Operation(summary = "Previsão do tempo", description = "Previsão para os próximos dias (máx 5)")
    public ResponseEntity<ForecastResponse> getForecast(
            @RequestParam @NotBlank String city,
            @RequestParam(defaultValue = "5") @Min(1) @Max(5) int days
    ) {
        return ResponseEntity.ok(mapper.toResponse(getForecast.execute(city, days)));
    }

    @GetMapping("/history")
    @Operation(summary = "Histórico de clima", description = "Busca histórico de dados climáticos armazenados no Elasticsearch")
    public ResponseEntity<WeatherHistoryResponse> getHistory(
            @RequestParam @NotBlank String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        Instant resolvedFrom = from != null ? from : Instant.now().minusSeconds(86400 * 7);
        Instant resolvedTo = to != null ? to : Instant.now();
        return ResponseEntity.ok(mapper.toHistoryResponse(
                getWeatherHistory.execute(city, resolvedFrom, resolvedTo, page, size)
        ));
    }

    @GetMapping("/cities")
    @Operation(summary = "Cidades com dados", description = "Lista cidades que possuem dados históricos no Elasticsearch")
    public ResponseEntity<List<String>> getCities() {
        // Retornado via repositório — delegar para um use case simples
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Forçar atualização", description = "Força a busca e salvamento do clima atual para uma cidade")
    public ResponseEntity<CurrentWeatherResponse> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        return ResponseEntity.ok(mapper.toResponse(refreshWeather.execute(request.city())));
    }
}
