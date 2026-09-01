package com.govos.core.infrastructure.persistence.project;

import com.govos.core.domain.project.CivicProject;
import com.govos.core.domain.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaProjectRepositoryImpl implements ProjectRepository {

    private final SpringDataProjectRepository springDataProjectRepository;

    @Override
    public List<CivicProject> findAllByTenantId(UUID tenantId) {
        return springDataProjectRepository.findAllByTenantId(tenantId);
    }

    @Override
    public Optional<CivicProject> findByIdAndTenantId(UUID id, UUID tenantId) {
        return springDataProjectRepository.findByIdAndTenantId(id, tenantId);
    }

    @Override
    public CivicProject save(CivicProject project) {
        return springDataProjectRepository.save(project);
    }

    @Override
    public void delete(CivicProject project) {
        project.setDeleted(true);
        springDataProjectRepository.save(project);
    }

    @Override
    public long countByTenantId(UUID tenantId) {
        return springDataProjectRepository.countByTenantId(tenantId);
    }
}
