package com.govos.core.domain.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

/**
 * Tenant entity — root of the MTAS hierarchy.
 * Note: Does NOT extend BaseEntity (tenants are not tenant-scoped themselves).
 */
@Entity
@Table(name = "tenants")
@SQLRestriction("is_deleted = false")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "subdomain", nullable = false, unique = true, length = 100)
    private String subdomain;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Builder.Default
    @Column(name = "primary_color", length = 7)
    private String primaryColor = "#1B4FD8";

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Builder.Default
    @Column(name = "country", nullable = false, length = 100)
    private String country = "India";

    @Builder.Default
    @Column(name = "timezone", nullable = false, length = 50)
    private String timezone = "Asia/Kolkata";

    @Builder.Default
    @Column(name = "locale", nullable = false, length = 10)
    private String locale = "en-IN";

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Builder.Default
    @Column(name = "sla_critical_hours", nullable = false)
    private int slaCriticalHours = 4;

    @Builder.Default
    @Column(name = "sla_high_hours", nullable = false)
    private int slaHighHours = 24;

    @Builder.Default
    @Column(name = "sla_medium_hours", nullable = false)
    private int slaMediumHours = 72;

    @Builder.Default
    @Column(name = "sla_low_hours", nullable = false)
    private int slaLowHours = 168;

    @Builder.Default
    @Column(name = "max_sessions", nullable = false)
    private int maxSessions = 3;

    @Builder.Default
    @Column(name = "mfa_required", nullable = false)
    private boolean mfaRequired = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
