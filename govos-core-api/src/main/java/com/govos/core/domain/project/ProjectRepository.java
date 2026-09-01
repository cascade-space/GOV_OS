package com.govos.core.domain.project;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository {
    List<CivicProject> findAllByTenantId(UUID tenantId);
    Optional<CivicProject> findByIdAndTenantId(UUID id, UUID tenantId);
    CivicProject save(CivicProject project);
    void delete(CivicProject project);
    long countByTenantId(UUID tenantId);
}
