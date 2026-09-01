package com.govos.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * GovOS Core API — Primary Transactional Engine
 * <p>
 * Architecture: Hexagonal (Ports & Adapters)
 * Packages:
 *   com.govos.core.domain          — Pure business rules (no Spring annotations)
 *   com.govos.core.application     — Use cases, @Service, @Transactional
 *   com.govos.core.infrastructure  — DB adapters, MinIO, Redis, OpenSearch
 *   com.govos.core.presentation    — @RestController, DTOs, security filters
 * <p>
 * Multi-Tenant: Every request carries tenant_id from JWT.
 * RLS: PostgreSQL SET LOCAL app.tenant_id at every transaction start.
 *
 * @author Prajna Labs × Cascade Technologies Solutions
 */
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "jwtAuditorAware")
@ConfigurationPropertiesScan("com.govos.core.infrastructure.config")
@EnableAsync
@EnableScheduling
public class GovOsCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(GovOsCoreApplication.class, args);
    }
}
