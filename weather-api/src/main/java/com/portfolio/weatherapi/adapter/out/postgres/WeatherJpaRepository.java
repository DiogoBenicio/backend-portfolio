package com.portfolio.weatherapi.adapter.out.postgres;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface WeatherJpaRepository extends JpaRepository<WeatherEntity, String> {

    Page<WeatherEntity> findByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThan(
            String city, Instant from, Instant to, Pageable pageable);

    List<WeatherEntity> findTop500ByCityIgnoreCaseAndTimestampGreaterThanEqualAndTimestampLessThanOrderByTimestampAsc(
            String city, Instant from, Instant to);

    @Query(value = """
            SELECT DISTINCT TO_CHAR(timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD')
            FROM weather_data
            WHERE LOWER(city) = LOWER(:city)
              AND timestamp >= :from
              AND timestamp < :to
            ORDER BY 1
            """, nativeQuery = true)
    List<String> findDaysWithData(
            @Param("city") String city,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("SELECT DISTINCT w.city FROM WeatherEntity w ORDER BY w.city")
    List<String> findDistinctCities();
}
