package com.govos.core.domain.directive;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MlaDirectiveRepository {
    MlaDirective save(MlaDirective directive);
    Optional<MlaDirective> findById(UUID id);
    List<MlaDirective> findByTenantId(UUID tenantId);
    List<MlaDirective> findByComplaintId(UUID complaintId);
    List<MlaDirective> findByConstituency(UUID tenantId, String constituency);
}
