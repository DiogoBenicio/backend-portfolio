package com.portfolio.weatherapi.adapter.out.openmeteo;

import com.portfolio.weatherapi.adapter.out.openmeteo.dto.OpenMeteoResponse;
import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class OpenMeteoClientAdapter implements HistoricalWeatherClient {

    private static final Logger log = LoggerFactory.getLogger(OpenMeteoClientAdapter.class);
    private static final String BASE_URL = "https://archive-api.open-meteo.com";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TS_FMT   = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    private final WebClient webClient;

    public OpenMeteoClientAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(BASE_URL).build();
    }

    @Override
    public List<Weather> fetchHistoricalHourly(String city, double latitude, double longitude,
                                               Instant from, Instant to) {
        String startDate = DATE_FMT.format(from.atZone(ZoneOffset.UTC).toLocalDate());
        String endDate   = DATE_FMT.format(to.atZone(ZoneOffset.UTC).toLocalDate());

        log.debug("Open-Meteo: buscando histórico para '{}' de {} até {}", city, startDate, endDate);

        OpenMeteoResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/archive")
                        .queryParam("latitude",  latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("start_date", startDate)
                        .queryParam("end_date",   endDate)
                        .queryParam("hourly",
                                "temperature_2m,apparent_temperature,dew_point_2m," +
                                "relative_humidity_2m,surface_pressure," +
                                "wind_speed_10m,wind_direction_10m," +
                                "precipitation,global_tilted_irradiance,shortwave_radiation")
                        .queryParam("wind_speed_unit", "kmh")
                        .queryParam("timezone", "UTC")
                        .build())
                .retrieve()
                .bodyToMono(OpenMeteoResponse.class)
                .block();

        if (response == null || response.hourly() == null || response.hourly().time() == null) {
            log.warn("Open-Meteo: resposta vazia para '{}'", city);
            return List.of();
        }

        OpenMeteoResponse.HourlyData h = response.hourly();
        int size = h.time().size();
        List<Weather> result = new ArrayList<>(size);

        for (int i = 0; i < size; i++) {
            Double temp     = safeDouble(h.temperature2m(), i);
            Double feels    = safeDouble(h.apparentTemperature(), i);
            Double dewPt    = safeDouble(h.dewPoint2m(), i);
            Integer hum     = safeInt(h.relativeHumidity2m(), i);
            Double pres     = safeDouble(h.surfacePressure(), i);
            Double wind     = safeDouble(h.windSpeed10m(), i);
            Integer wdir    = safeInt(h.windDirection10m(), i);
            Double rain     = safeDouble(h.precipitation(), i);
            Double gti      = safeDouble(h.globalTiltedIrradiance(), i);
            Double swRad    = safeDouble(h.shortwaveRadiation(), i);

            if (temp == null || hum == null) continue;

            // UV estimado a partir da radiação solar horizontal (fórmula WHO/ICNIRP)
            int uvEst = swRad != null ? (int) Math.min(16, Math.round(swRad / 25.0)) : 0;

            Instant ts = LocalDateTime.parse(h.time().get(i), TS_FMT)
                    .toInstant(ZoneOffset.UTC);

            result.add(new Weather(
                    city, "BR",
                    latitude, longitude,
                    temp,
                    feels != null ? feels : temp,
                    hum,
                    pres != null ? (int) Math.round(pres) : 0,
                    wind != null ? wind : 0.0,
                    wdir != null ? degToCompass(wdir) : "N",
                    "", "",
                    uvEst,
                    rain != null ? rain : 0.0,
                    dewPt != null ? dewPt : 0.0,
                    gti != null ? gti : 0.0,
                    ts
            ));
        }

        log.info("Open-Meteo: {} pontos retornados para '{}'", result.size(), city);
        return result;
    }

    private Double safeDouble(List<Double> list, int i) {
        if (list == null || i >= list.size()) return null;
        return list.get(i);
    }

    private Integer safeInt(List<Integer> list, int i) {
        if (list == null || i >= list.size()) return null;
        return list.get(i);
    }

    private String degToCompass(int deg) {
        String[] dirs = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"};
        return dirs[(int) Math.round(deg / 45.0) % 8];
    }
}
