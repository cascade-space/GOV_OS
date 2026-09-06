package com.govos.core.infrastructure.persistence.directive;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringDataMlaDirectiveRepository extends JpaRepository<JpaMlaDirective, UUID> {
    List<JpaMlaDirective> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<JpaMlaDirective> findByComplaintIdOrderByCreatedAtDesc(UUID complaintId);
    List<JpaMlaDirective> findByTenantIdAndConstituencyIgnoreCaseOrderByCreatedAtDesc(UUID tenantId, String constituency);
}
