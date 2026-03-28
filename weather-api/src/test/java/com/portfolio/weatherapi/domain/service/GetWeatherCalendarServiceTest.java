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
@DisplayName("GetWeatherCalendarService")
class GetWeatherCalendarServiceTest {

    @Mock
    private WeatherDataRepository repository;

    private GetWeatherCalendarService service;

    @BeforeEach
    void setUp() {
        service = new GetWeatherCalendarService(repository);
    }

    @Test
    @DisplayName("deve retornar os dias com dados do repositório")
    void shouldReturnDaysFromRepository() {
        List<String> days = List.of("2025-03-01", "2025-03-05", "2025-03-10");
        when(repository.findDaysWithData("Uberlândia", 2025, 3)).thenReturn(days);

        List<String> result = service.execute("Uberlândia", 2025, 3);

        assertThat(result).containsExactlyElementsOf(days);
        verify(repository, times(1)).findDaysWithData("Uberlândia", 2025, 3);
    }

    @Test
    @DisplayName("deve retornar lista vazia quando não há dados no mês")
    void shouldReturnEmptyForMonthWithNoData() {
        when(repository.findDaysWithData(anyString(), anyInt(), anyInt())).thenReturn(List.of());

        List<String> result = service.execute("Brasília", 2020, 1);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("deve passar year e month corretamente ao repositório")
    void shouldPassYearAndMonthCorrectly() {
        when(repository.findDaysWithData("Recife", 2024, 12)).thenReturn(List.of("2024-12-25"));

        service.execute("Recife", 2024, 12);

        verify(repository).findDaysWithData("Recife", 2024, 12);
        verify(repository, never()).findDaysWithData(eq("Recife"), eq(2024), intThat(m -> m != 12));
    }
}
