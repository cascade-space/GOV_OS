package com.govos.core.infrastructure.persistence.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpringDataComplaintRepository extends JpaRepository<JpaComplaint, UUID> {
    List<JpaComplaint> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<JpaComplaint> findByTenantId(UUID tenantId);
    List<JpaComplaint> findByTenantIdAndWardId(UUID tenantId, UUID wardId);
    java.util.Optional<JpaComplaint> findByComplaintNumber(String complaintNumber);
    List<JpaComplaint> findByReporterMobileOrderByCreatedAtDesc(String reporterMobile);
    List<JpaComplaint> findByAssignedToIdOrderByCreatedAtDesc(UUID assignedToId);
    List<JpaComplaint> findByTenantIdAndAssignedToIdOrderByCreatedAtDesc(UUID tenantId, UUID assignedToId);
    List<JpaComplaint> findByStatusIn(List<com.govos.core.domain.complaint.ComplaintStatus> statuses);
    List<JpaComplaint> findByReporterIdOrderByCreatedAtDesc(UUID reporterId);

    /**
     * Constituency-scoped complaint list: joins complaints → wards → constituencies by name.
     * Used by the REP (MLA) role to see only their constituency's complaints.
     */
    @Query(value = """
        SELECT c.* FROM complaints c
        LEFT JOIN wards w ON c.ward_id = w.id
        LEFT JOIN constituencies con ON w.constituency_id = con.id
        WHERE c.tenant_id = :tenantId
          AND (c.ward_id IS NULL OR con.name ILIKE :constituency OR con.code ILIKE :constituency)
          AND c.is_deleted = false
        ORDER BY c.created_at DESC
        """, nativeQuery = true)
    List<JpaComplaint> findByTenantIdAndConstituency(@Param("tenantId") UUID tenantId, @Param("constituency") String constituency);

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

    @Query(value = "SELECT COUNT(*) FROM complaints WHERE asset_id = :assetId AND status NOT IN ('RESOLVED','CLOSED') AND is_deleted = false", nativeQuery = true)
    long countActiveByAssetId(@Param("assetId") UUID assetId);

    @Query(value = "SELECT COUNT(*) FROM complaints WHERE project_id = :projectId AND is_deleted = false", nativeQuery = true)
    long countByProjectId(@Param("projectId") UUID projectId);
}
