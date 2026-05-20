package com.portfolio.weatherapi.adapter.out.openweather;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openweather")
public class OpenWeatherProperties {

    @NonNull private String apiKey  = "";
    @NonNull private String baseUrl = "https://api.openweathermap.org/data/2.5";
    @NonNull private String units   = "metric";
    @NonNull private String lang    = "pt_br";

    @NonNull public String getApiKey() { return apiKey; }
    public void setApiKey(@NonNull String apiKey) { this.apiKey = apiKey; }

    @NonNull public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(@NonNull String baseUrl) { this.baseUrl = baseUrl; }

    @NonNull public String getUnits() { return units; }
    public void setUnits(@NonNull String units) { this.units = units; }

    @NonNull public String getLang() { return lang; }
    public void setLang(@NonNull String lang) { this.lang = lang; }
}
