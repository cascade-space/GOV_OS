package com.govos.core.infrastructure.persistence.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataAuditLogRepository extends JpaRepository<JpaAuditLog, UUID> {
    List<JpaAuditLog> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    @Query("SELECT a FROM JpaAuditLog a WHERE a.resourceId = :idOrLabel OR a.resourceLabel = :idOrLabel ORDER BY a.createdAt ASC")
    List<JpaAuditLog> findTimelineByResourceIdOrLabel(@Param("idOrLabel") String idOrLabel);
}
