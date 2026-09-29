package com.govos.core.infrastructure.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Automatically cleans up failed migration rows in flyway_schema_history
            // so deployments can safely recover and proceed without manual psql intervention
            flyway.repair();
            flyway.migrate();
        };
    }
}
