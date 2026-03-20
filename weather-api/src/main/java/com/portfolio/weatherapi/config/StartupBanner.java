package com.portfolio.weatherapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class StartupBanner implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${server.port:8080}")
    private String port;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String cyan  = "\033[36m";
        String reset = "\033[0m";
        String bold  = "\033[1m";

        System.out.println(cyan);
        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║  ██╗    ██╗███████╗ █████╗ ████████╗██╗  ██╗║");
        System.out.println("║  ██║    ██║██╔════╝██╔══██╗╚══██╔══╝██║  ██║║");
        System.out.println("║  ██║ █╗ ██║█████╗  ███████║   ██║   ███████║║");
        System.out.println("║  ██║███╗██║██╔══╝  ██╔══██║   ██║   ██╔══██║║");
        System.out.println("║  ╚███╔███╔╝███████╗██║  ██║   ██║   ██║  ██║║");
        System.out.println("║   ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝║");
        System.out.println("║                                              ║");
        System.out.println("║  WEATHER-API  ·  Spring Boot 3 + ES 8        ║");
        System.out.println("╚══════════════════════════════════════════════╝");
        System.out.println(reset + bold + "  Porta: " + port + "  |  Profile: "
                + System.getenv().getOrDefault("SPRING_PROFILES_ACTIVE", "default") + reset);
        System.out.println();
    }
}
