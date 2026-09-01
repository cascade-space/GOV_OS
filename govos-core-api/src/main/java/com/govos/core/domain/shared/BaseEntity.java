package com.govos.core.domain.shared;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

/**
 * Base superclass for ALL tenant-scoped entities.
 * <p>
 * Architectural invariants enforced here:
 * - Every entity has tenant_id (MTAS foundation)
 * - Every entity has full audit trail (created_at/by, updated_at/by)
 * - Soft delete only — never hard deletes (@SQLRestriction filters is_deleted = false)
 * - UUID primary keys (no sequential IDs exposed externally)
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("is_deleted = false AND (current_setting('app.tenant_id', true) IS NULL OR tenant_id = current_setting('app.tenant_id', true)::uuid)")
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /**
     * MANDATORY on all tenant-scoped entities.
     * Used by Spring Security filter + PostgreSQL RLS for isolation.
     */
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private UUID tenantId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private UUID createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    /**
     * Soft-delete this entity.
     * Sets is_deleted = true and records deletion timestamp.
     * Never call entityManager.remove() — always call this method.
     */
    public void softDelete(UUID deletedBy) {
        this.deleted = true;
        this.deletedAt = Instant.now();
        this.updatedBy = deletedBy;
    }
}
