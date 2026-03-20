package com.portfolio.weatherapi.domain.service;

import com.portfolio.weatherapi.domain.model.Weather;
import com.portfolio.weatherapi.domain.port.out.WeatherDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetWeatherHistoryService")
class GetWeatherHistoryServiceTest {

    @Mock
    private WeatherDataRepository repository;

    private GetWeatherHistoryService service;

    private static Weather weather(String city) {
        return new Weather(city, "BR", -15.0, -47.0,
                25.0, 26.0, 65, 1013, 10.0, "N",
                "ensolarado", "01d", 5, 0.0, Instant.now());
    }

    @BeforeEach
    void setUp() {
        service = new GetWeatherHistoryService(repository);
    }

    @Test
    @DisplayName("deve delegar ao repositório com city, from, to e pageable corretos")
    void shouldDelegateToRepositoryWithCorrectArgs() {
        Instant from = Instant.parse("2024-01-01T00:00:00Z");
        Instant to = Instant.parse("2024-01-31T23:59:59Z");
        Page<Weather> page = new PageImpl<>(List.of(weather("Brasília")));
        when(repository.findByCity(eq("Brasília"), eq(from), eq(to), any())).thenReturn(page);

        Page<Weather> result = service.execute("Brasília", from, to, 0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).city()).isEqualTo("Brasília");
        verify(repository).findByCity(eq("Brasília"), eq(from), eq(to), any());
    }

    @Test
    @DisplayName("deve criar pageable com ordenação DESC por timestamp")
    void shouldOrderByTimestampDesc() {
        Instant from = Instant.now().minusSeconds(3600);
        Instant to = Instant.now();
        when(repository.findByCity(anyString(), any(), any(), any()))
                .thenReturn(Page.empty());

        service.execute("Recife", from, to, 0, 5);

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(repository).findByCity(eq("Recife"), eq(from), eq(to), pageableCaptor.capture());

        PageRequest pageable = pageableCaptor.getValue();
        assertThat(pageable.getPageNumber()).isEqualTo(0);
        assertThat(pageable.getPageSize()).isEqualTo(5);
        assertThat(pageable.getSort().getOrderFor("timestamp"))
                .isNotNull()
                .satisfies(order -> assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC));
    }

    @Test
    @DisplayName("deve retornar página vazia quando repositório não encontrar resultados")
    void shouldReturnEmptyPageWhenNoResults() {
        when(repository.findByCity(anyString(), any(), any(), any())).thenReturn(Page.empty());

        Page<Weather> result = service.execute("CidadeInexistente", Instant.now(), Instant.now(), 0, 10);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("deve suportar paginação com page > 0")
    void shouldSupportPagination() {
        when(repository.findByCity(anyString(), any(), any(), any())).thenReturn(Page.empty());

        service.execute("Fortaleza", Instant.now().minusSeconds(7200), Instant.now(), 2, 20);

        ArgumentCaptor<PageRequest> captor = ArgumentCaptor.forClass(PageRequest.class);
        verify(repository).findByCity(anyString(), any(), any(), captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(2);
        assertThat(captor.getValue().getPageSize()).isEqualTo(20);
    }
}
