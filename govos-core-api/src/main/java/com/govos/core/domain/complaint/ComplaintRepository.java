package com.govos.core.domain.complaint;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ComplaintRepository {
    Complaint save(Complaint complaint);
    Optional<Complaint> findById(UUID id);
    List<Complaint> findByTenantId(UUID tenantId);
    long countByTenantId(UUID tenantId);
    long countResolvedByTenantId(UUID tenantId);
    long countByTenantIdAndStatus(UUID tenantId, ComplaintStatus status);
    long countByAssignedToId(UUID assignedToId);
    long countByAssignedToIdAndStatus(UUID assignedToId, ComplaintStatus status);
    List<Object[]> getMonthlyTrend(UUID tenantId);
    String generateNextComplaintNumber(UUID tenantId);
    Optional<Complaint> findByComplaintNumber(String complaintNumber);
    List<Complaint> findByReporterMobile(String reporterMobile);
}
