package com.example.taskmanager.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class PostgresUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SPRING_URL = "spring.datasource.url";
    private static final String ENV_URL = "SPRING_DATASOURCE_URL";
    private static final String DATABASE_URL = "DATABASE_URL";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty(SPRING_URL);
        if (url == null || url.isBlank()) {
            url = environment.getProperty(ENV_URL);
        }
        if (url == null || url.isBlank()) {
            url = environment.getProperty(DATABASE_URL);
        }
        if (url == null) {
            return;
        }
        if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
            String jdbcUrl = "jdbc:" + url.replaceFirst("^postgres://", "postgresql://");
            Map<String, Object> props = new HashMap<>();
            props.put(SPRING_URL, jdbcUrl);
            environment.getPropertySources().addFirst(new MapPropertySource("postgres-url-fix", props));
        }
    }
}
