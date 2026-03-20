package com.portfolio.weatherapi.config;

import com.portfolio.weatherapi.domain.port.in.*;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import com.portfolio.weatherapi.domain.port.out.WeatherProviderClient;
import com.portfolio.weatherapi.domain.service.*;
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
}
