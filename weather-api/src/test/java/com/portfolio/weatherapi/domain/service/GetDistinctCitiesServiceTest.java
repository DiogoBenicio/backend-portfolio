package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetDistinctCitiesService")
class GetDistinctCitiesServiceTest {

    @Mock
    private WeatherDataRepository repository;

    private GetDistinctCitiesService service;

    @BeforeEach
    void setUp() {
        service = new GetDistinctCitiesService(repository);
    }

    @Test
    @DisplayName("deve retornar cidades distintas do repositório")
    void shouldReturnDistinctCitiesFromRepository() {
        List<String> cities = List.of("Brasília", "Recife", "Uberlândia");
        when(repository.findDistinctCities()).thenReturn(cities);

        List<String> result = service.execute();

        assertThat(result).containsExactlyElementsOf(cities);
        verify(repository, times(1)).findDistinctCities();
    }

    @Test
    @DisplayName("deve retornar lista vazia quando não há dados")
    void shouldReturnEmptyWhenNoCities() {
        when(repository.findDistinctCities()).thenReturn(List.of());

        List<String> result = service.execute();

        assertThat(result).isEmpty();
    }
}
