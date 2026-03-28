package com.portfolio.weatherapi.adapter.out.elasticsearch.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.Instant;

@Document(indexName = "weather-data", createIndex = false)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String city;

    @Field(type = FieldType.Keyword)
    private String country;

    @Field(type = FieldType.Double)
    private double latitude;

    @Field(type = FieldType.Double)
    private double longitude;

    @Field(type = FieldType.Double)
    private double temperature;

    @Field(type = FieldType.Double)
    private double feelsLike;

    @Field(type = FieldType.Integer)
    private int humidity;

    @Field(type = FieldType.Integer)
    private int pressure;

    @Field(type = FieldType.Double)
    private double windSpeed;

    @Field(type = FieldType.Keyword)
    private String windDirection;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private String icon;

    @Field(type = FieldType.Integer)
    private int uvIndex;

    @Field(type = FieldType.Double)
    private double rainfall;

    @Field(type = FieldType.Double)
    private double dewPoint;

    @Field(type = FieldType.Double)
    private double radiation;

    @Field(type = FieldType.Date)
    private Instant timestamp;
}
