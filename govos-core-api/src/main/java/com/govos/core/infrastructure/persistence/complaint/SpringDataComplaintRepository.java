package com.govos.core.infrastructure.persistence.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpringDataComplaintRepository extends JpaRepository<JpaComplaint, UUID> {
    List<JpaComplaint> findByTenantId(UUID tenantId);
    java.util.Optional<JpaComplaint> findByComplaintNumber(String complaintNumber);
    List<JpaComplaint> findByReporterMobileOrderByCreatedAtDesc(String reporterMobile);

    long countByTenantId(UUID tenantId);

    @Query(value = "SELECT COUNT(*) FROM complaints WHERE tenant_id = :tenantId AND status IN ('RESOLVED','CLOSED') AND is_deleted = false", nativeQuery = true)
    long countResolvedByTenantId(@Param("tenantId") UUID tenantId);

    @Query(value = "SELECT COUNT(*) FROM complaints WHERE tenant_id = :tenantId AND status = :status AND is_deleted = false", nativeQuery = true)
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") String status);

    long countByAssignedToId(UUID assignedToId);

    long countByAssignedToIdAndStatus(UUID assignedToId, com.govos.core.domain.complaint.ComplaintStatus status);

    /**
     * Monthly trend: returns rows of (month_label, total_count, resolved_count) for the past 6 months.
     * month_label format: 'MMM YY' e.g. 'Jan 25'
     */
    @Query(value = """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') AS month,
            COUNT(*) AS complaints,
            COUNT(*) FILTER (WHERE status IN ('RESOLVED','CLOSED')) AS resolved
        FROM complaints
        WHERE tenant_id = :tenantId
          AND is_deleted = false
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
        """, nativeQuery = true)
    List<Object[]> getMonthlyTrend(@Param("tenantId") UUID tenantId);

    @Query(value = "SELECT COUNT(id) + 1 FROM complaints WHERE tenant_id = :tenantId", nativeQuery = true)
    long getNextSequenceForTenant(@Param("tenantId") UUID tenantId);
}
