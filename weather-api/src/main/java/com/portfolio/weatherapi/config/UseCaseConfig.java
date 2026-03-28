package com.portfolio.weatherapi.config;

import com.portfolio.weatherapi.domain.port.in.*;
import com.portfolio.weatherapi.domain.port.out.HistoricalWeatherClient;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import com.portfolio.weatherapi.domain.service.*;
import com.portfolio.weatherapi.domain.service.GetWeatherCalendarService;
import com.portfolio.weatherapi.domain.service.GetWeatherSensorsService;
import com.portfolio.weatherapi.domain.service.PopulateWeatherService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class UseCaseConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public GetCurrentWeatherUseCase getCurrentWeatherUseCase(
            WeatherProviderClient client, WeatherDataRepository repository) {
        return new GetCurrentWeatherService(client, repository);
    }

    @Bean
    public GetForecastUseCase getForecastUseCase(WeatherProviderClient client) {
        return new GetForecastService(client);
    }

    @Bean
    public GetWeatherHistoryUseCase getWeatherHistoryUseCase(WeatherDataRepository repository) {
        return new GetWeatherHistoryService(repository);
    }

    @Bean
    public RefreshWeatherUseCase refreshWeatherUseCase(
            WeatherProviderClient client, WeatherDataRepository repository) {
        return new RefreshWeatherService(client, repository);
    }

    @Bean
    public GetWeatherSensorsUseCase getWeatherSensorsUseCase(
            WeatherDataRepository repository, WeatherProviderClient client,
            HistoricalWeatherClient historicalClient) {
        return new GetWeatherSensorsService(repository, client, historicalClient);
    }

    @Bean
    public GetWeatherCalendarUseCase getWeatherCalendarUseCase(WeatherDataRepository repository) {
        return new GetWeatherCalendarService(repository);
    }

    @Bean
    public PopulateWeatherUseCase populateWeatherUseCase(
            WeatherProviderClient client, WeatherDataRepository repository) {
        return new PopulateWeatherService(client, repository);
    }
}
