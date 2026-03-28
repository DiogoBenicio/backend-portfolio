package com.portfolio.weatherapi.adapter.out.elasticsearch;

import com.portfolio.weatherapi.adapter.out.elasticsearch.document.WeatherDocument;
import com.portfolio.weatherapi.domain.model.Weather;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ElasticsearchWeatherAdapter")
class ElasticsearchWeatherAdapterTest {

    @Mock
    private ElasticsearchOperations operations;

    @Mock
    private IndexOperations indexOps;

    private ElasticsearchWeatherAdapter adapter;

    private static Weather weather(String city, Instant timestamp) {
        return new Weather(city, "BR", -18.9, -48.3,
                28.5, 30.1, 60, 1012, 15.0, "NE",
                "ensolarado", "01d", 5, 0.0, 0.0, 0.0, timestamp);
    }

    @BeforeEach
    void setUp() {
        adapter = new ElasticsearchWeatherAdapter(operations);
    }

    // ─── save ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("save()")
    class SaveTests {

        @BeforeEach
        void setUpSave() {
            when(operations.indexOps(any(IndexCoordinates.class))).thenReturn(indexOps);
            when(indexOps.exists()).thenReturn(true);
        }

        @Test
        @DisplayName("deve salvar no índice mensal correto")
        void shouldSaveToCorrectMonthlyIndex() {
            Instant ts = Instant.parse("2025-03-15T10:00:00Z");
            Weather w  = weather("Uberlândia", ts);

            adapter.save(w);

            ArgumentCaptor<IndexCoordinates> coordCaptor = ArgumentCaptor.forClass(IndexCoordinates.class);
            verify(operations).save(any(WeatherDocument.class), coordCaptor.capture());
            assertThat(coordCaptor.getValue().getIndexNames()).containsExactly("weather-data-2025-03");
        }

        @Test
        @DisplayName("ID deve ser determinístico: city-slug + YYYY-MM-DD-HH")
        void shouldGenerateDeterministicId() {
            Instant ts = Instant.parse("2025-03-15T14:30:00Z"); // hora 14 UTC
            Weather w  = weather("São Paulo", ts);

            adapter.save(w);

            ArgumentCaptor<WeatherDocument> docCaptor = ArgumentCaptor.forClass(WeatherDocument.class);
            verify(operations).save(docCaptor.capture(), any());
            assertThat(docCaptor.getValue().getId()).isEqualTo("s-o-paulo-2025-03-15-14");
        }

        @Test
        @DisplayName("dois saves na mesma hora geram o mesmo ID (upsert idempotente)")
        void shouldProduceSameIdForSameHour() {
            Instant t1 = Instant.parse("2025-03-15T14:05:00Z");
            Instant t2 = Instant.parse("2025-03-15T14:55:00Z");

            adapter.save(weather("Recife", t1));
            adapter.save(weather("Recife", t2));

            ArgumentCaptor<WeatherDocument> captor = ArgumentCaptor.forClass(WeatherDocument.class);
            verify(operations, times(2)).save(captor.capture(), any());
            List<String> ids = captor.getAllValues().stream().map(WeatherDocument::getId).toList();
            assertThat(ids.get(0)).isEqualTo(ids.get(1));
        }

        @Test
        @DisplayName("saves em horas diferentes geram IDs diferentes")
        void shouldProduceDifferentIdsForDifferentHours() {
            Instant t1 = Instant.parse("2025-03-15T13:00:00Z");
            Instant t2 = Instant.parse("2025-03-15T14:00:00Z");

            adapter.save(weather("Recife", t1));
            adapter.save(weather("Recife", t2));

            ArgumentCaptor<WeatherDocument> captor = ArgumentCaptor.forClass(WeatherDocument.class);
            verify(operations, times(2)).save(captor.capture(), any());
            List<String> ids = captor.getAllValues().stream().map(WeatherDocument::getId).toList();
            assertThat(ids.get(0)).isNotEqualTo(ids.get(1));
        }

        @Test
        @DisplayName("deve criar o índice quando não existe")
        void shouldCreateIndexWhenAbsent() {
            when(indexOps.exists()).thenReturn(false);
            when(operations.indexOps(any(Class.class))).thenReturn(indexOps);
            when(indexOps.createMapping()).thenReturn(Document.create());

            adapter.save(weather("Fortaleza", Instant.parse("2025-06-01T08:00:00Z")));

            verify(indexOps).create();
            verify(indexOps).putMapping(any(Document.class));
        }

        @Test
        @DisplayName("não deve recriar o índice quando já existe")
        void shouldNotRecreateExistingIndex() {
            when(indexOps.exists()).thenReturn(true);

            adapter.save(weather("Fortaleza", Instant.parse("2025-06-01T08:00:00Z")));

            verify(indexOps, never()).create();
        }
    }

    // ─── findSensorData ───────────────────────────────────────────────────────

    @Nested
    @DisplayName("findSensorData()")
    class FindSensorDataTests {

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("deve buscar em índices corretos para range de um mês")
        void shouldQuerySingleMonthIndex() {
            Instant from = Instant.parse("2025-03-01T00:00:00Z");
            Instant to   = Instant.parse("2025-03-07T23:59:59Z");
            SearchHits<WeatherDocument> emptyHits = mock(SearchHits.class);
            when(emptyHits.getSearchHits()).thenReturn(List.of());
            when(operations.search(any(CriteriaQuery.class), eq(WeatherDocument.class), any(IndexCoordinates.class)))
                    .thenReturn(emptyHits);

            adapter.findSensorData("Uberlândia", from, to);

            ArgumentCaptor<IndexCoordinates> coordCaptor = ArgumentCaptor.forClass(IndexCoordinates.class);
            verify(operations).search(any(CriteriaQuery.class), eq(WeatherDocument.class), coordCaptor.capture());
            assertThat(coordCaptor.getValue().getIndexNames()).containsExactly("weather-data-2025-03");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("deve buscar em múltiplos índices para range multi-mês")
        void shouldQueryMultipleMonthIndices() {
            Instant from = Instant.parse("2025-02-25T00:00:00Z");
            Instant to   = Instant.parse("2025-04-05T23:59:59Z");
            SearchHits<WeatherDocument> emptyHits = mock(SearchHits.class);
            when(emptyHits.getSearchHits()).thenReturn(List.of());
            when(operations.search(any(CriteriaQuery.class), eq(WeatherDocument.class), any(IndexCoordinates.class)))
                    .thenReturn(emptyHits);

            adapter.findSensorData("Belém", from, to);

            ArgumentCaptor<IndexCoordinates> coordCaptor = ArgumentCaptor.forClass(IndexCoordinates.class);
            verify(operations).search(any(CriteriaQuery.class), eq(WeatherDocument.class), coordCaptor.capture());
            assertThat(coordCaptor.getValue().getIndexNames())
                    .containsExactlyInAnyOrder("weather-data-2025-02", "weather-data-2025-03", "weather-data-2025-04");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("deve mapear WeatherDocument para Weather corretamente")
        void shouldMapDocumentToModel() {
            Instant ts = Instant.parse("2025-03-10T12:00:00Z");
            WeatherDocument doc = WeatherDocument.builder()
                    .id("uberlandia-2025-03-10-12")
                    .city("Uberlândia").country("BR")
                    .latitude(-18.9).longitude(-48.3)
                    .temperature(28.5).feelsLike(30.1)
                    .humidity(60).pressure(1012)
                    .windSpeed(15.0).windDirection("NE")
                    .description("ensolarado").icon("01d")
                    .uvIndex(5).rainfall(0.0).timestamp(ts)
                    .build();

            SearchHit<WeatherDocument> hit = mock(SearchHit.class);
            when(hit.getContent()).thenReturn(doc);
            SearchHits<WeatherDocument> hits = mock(SearchHits.class);
            when(hits.getSearchHits()).thenReturn(List.of(hit));
            when(operations.search(any(CriteriaQuery.class), eq(WeatherDocument.class), any(IndexCoordinates.class)))
                    .thenReturn(hits);

            List<Weather> result = adapter.findSensorData("Uberlândia",
                    Instant.parse("2025-03-01T00:00:00Z"), Instant.parse("2025-03-31T23:59:59Z"));

            assertThat(result).hasSize(1);
            Weather w = result.get(0);
            assertThat(w.city()).isEqualTo("Uberlândia");
            assertThat(w.temperature()).isEqualTo(28.5);
            assertThat(w.timestamp()).isEqualTo(ts);
        }
    }

    // ─── findDaysWithData ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("findDaysWithData()")
    class FindDaysWithDataTests {

        @BeforeEach
        void setUpCalendar() {
            when(operations.indexOps(any(IndexCoordinates.class))).thenReturn(indexOps);
            when(indexOps.exists()).thenReturn(true);
        }

        @Test
        @DisplayName("deve retornar lista vazia quando o índice do mês não existe")
        void shouldReturnEmptyWhenIndexAbsent() {
            when(indexOps.exists()).thenReturn(false);

            List<String> result = adapter.findDaysWithData("Uberlândia", 2025, 3);

            assertThat(result).isEmpty();
            verify(operations, never()).search(any(CriteriaQuery.class), any(), any(IndexCoordinates.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("deve retornar dias distintos com dados para o mês correto")
        void shouldReturnDistinctDays() {
            Instant ts1 = LocalDate.of(2025, 3, 5).atStartOfDay(ZoneOffset.UTC).toInstant();
            Instant ts2 = LocalDate.of(2025, 3, 5).atTime(14, 0).toInstant(ZoneOffset.UTC);
            Instant ts3 = LocalDate.of(2025, 3, 20).atStartOfDay(ZoneOffset.UTC).toInstant();

            List<WeatherDocument> docs = List.of(
                    docWithTimestamp(ts1), docWithTimestamp(ts2), docWithTimestamp(ts3));

            SearchHits<WeatherDocument> hits = mockHits(docs);
            when(operations.search(any(CriteriaQuery.class), eq(WeatherDocument.class),
                    eq(IndexCoordinates.of("weather-data-2025-03")))).thenReturn(hits);

            List<String> result = adapter.findDaysWithData("Uberlândia", 2025, 3);

            assertThat(result).containsExactlyInAnyOrder("2025-03-05", "2025-03-20");
        }

        @SuppressWarnings("unchecked")
        private SearchHits<WeatherDocument> mockHits(List<WeatherDocument> docs) {
            SearchHits<WeatherDocument> hits = mock(SearchHits.class);
            List<SearchHit<WeatherDocument>> searchHits = docs.stream().map(doc -> {
                SearchHit<WeatherDocument> hit = mock(SearchHit.class);
                when(hit.getContent()).thenReturn(doc);
                return hit;
            }).toList();
            when(hits.getSearchHits()).thenReturn(searchHits);
            return hits;
        }

        private WeatherDocument docWithTimestamp(Instant ts) {
            return WeatherDocument.builder()
                    .id("test").city("Uberlândia").country("BR")
                    .temperature(25.0).timestamp(ts).build();
        }
    }
}
