package com.govos.core.infrastructure.persistence.integration;

import com.govos.core.domain.integration.IntegrationConfig;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "integration_configs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "external_system"})
})
@Getter
@Setter
@NoArgsConstructor
public class JpaIntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "external_system", nullable = false, length = 50)
    private String externalSystem;

    @Column(name = "is_enabled", nullable = false)
    private boolean isEnabled = true;

    @Column(name = "webhook_url", nullable = false, length = 500)
    private String webhookUrl;

    @Column(name = "webhook_secret", nullable = false, length = 255)
    private String webhookSecret;

    @Column(name = "sync_categories", length = 500)
    private String syncCategories = "ALL";

    @Column(name = "auto_sync_on_create", nullable = false)
    private boolean autoSyncOnCreate = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public IntegrationConfig toDomain() {
        return IntegrationConfig.builder()
                .id(this.id)
                .tenantId(this.tenantId)
                .externalSystem(this.externalSystem)
                .isEnabled(this.isEnabled)
                .webhookUrl(this.webhookUrl)
                .webhookSecret(this.webhookSecret)
                .syncCategories(this.syncCategories)
                .autoSyncOnCreate(this.autoSyncOnCreate)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    public static JpaIntegrationConfig fromDomain(IntegrationConfig d) {
        JpaIntegrationConfig entity = new JpaIntegrationConfig();
        entity.setId(d.getId());
        entity.setTenantId(d.getTenantId());
        entity.setExternalSystem(d.getExternalSystem());
        entity.setEnabled(d.isEnabled());
        entity.setWebhookUrl(d.getWebhookUrl());
        entity.setWebhookSecret(d.getWebhookSecret());
        entity.setSyncCategories(d.getSyncCategories());
        entity.setAutoSyncOnCreate(d.isAutoSyncOnCreate());
        if (d.getCreatedAt() != null) entity.setCreatedAt(d.getCreatedAt());
        if (d.getUpdatedAt() != null) entity.setUpdatedAt(d.getUpdatedAt());
        return entity;
    }
}
