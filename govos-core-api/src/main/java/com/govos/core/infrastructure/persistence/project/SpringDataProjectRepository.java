package com.govos.core.infrastructure.persistence.project;

import com.govos.core.domain.project.CivicProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataProjectRepository extends JpaRepository<CivicProject, UUID> {
    List<CivicProject> findAllByTenantId(UUID tenantId);
    Optional<CivicProject> findByIdAndTenantId(UUID id, UUID tenantId);
    long countByTenantId(UUID tenantId);
}
