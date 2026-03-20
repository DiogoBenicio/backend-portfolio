package com.portfolio.weatherapi.adapter.out.openweather;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openweather")
public class OpenWeatherProperties {

    private String apiKey;
    private String baseUrl;
    private String units;
    private String lang;

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }

    public String getLang() { return lang; }
    public void setLang(String lang) { this.lang = lang; }
}
