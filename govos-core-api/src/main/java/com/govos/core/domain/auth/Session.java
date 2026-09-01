package com.govos.core.domain.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    /**
     * Hashed refresh token to prevent theft from database.
     * Raw refresh token is only sent to the client once.
     */
    @Column(name = "refresh_token", nullable = false, unique = true, length = 500)
    private String refreshToken;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "device_info")
    private String deviceInfo; // JSON { "ua": "...", "ip": "...", "type": "..." }

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Builder.Default
    @Column(name = "last_used_at", nullable = false)
    private Instant lastUsedAt = Instant.now();

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Builder.Default
    @Column(name = "is_revoked", nullable = false)
    private boolean revoked = false;
}
