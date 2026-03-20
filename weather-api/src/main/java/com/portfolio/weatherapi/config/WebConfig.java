package com.portfolio.weatherapi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS restrito: apenas o API Gateway (interno) acessa diretamente esta API.
        // Em produção, o Nginx é o único ponto de entrada e o gateway faz as requisições.
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://api-gateway:*",
                        "http://localhost:*"  // desenvolvimento local sem Docker
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("Content-Type", "Authorization", "X-Request-ID", "X-Forwarded-For")
                .maxAge(3600);
    }

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Weather API")
                        .description("API para consulta de dados meteorológicos — Arquitetura Hexagonal com Spring Boot 3 + Elasticsearch 8")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Diogo Silveira Benício")
                                .email("diogobenicio@hotmail.com")
                                .url("https://linkedin.com/in/diogosbenicio")));
    }
}
