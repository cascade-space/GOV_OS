package com.govos.core.domain.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationConfig {
    private UUID id;
    private UUID tenantId;
    private String externalSystem;
    private boolean isEnabled;
    private String webhookUrl;
    private String webhookSecret;
    private String syncCategories;
    private boolean autoSyncOnCreate;
    private Instant createdAt;
    private Instant updatedAt;
}
