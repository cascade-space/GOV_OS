package com.govos.core.application.project;

import com.govos.core.domain.project.ProjectRepository;
import com.govos.core.domain.project.CivicProject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<CivicProject> listProjects(UUID tenantId) {
        return projectRepository.findAllByTenantId(tenantId);
    }

    public CivicProject createProject(UUID tenantId, CivicProject dto) {
        CivicProject project = CivicProject.builder()
                .tenantId(tenantId)
                .projectId(dto.getProjectId())
                .title(dto.getTitle())
                .status(dto.getStatus())
                .budget(dto.getBudget())
                .spent(dto.getSpent())
                .startDate(dto.getStartDate())
                .estimatedEndDate(dto.getEstimatedEndDate())
                .completionPercentage(dto.getCompletionPercentage())
                .build();
        return projectRepository.save(project);
    }
    public CivicProject updateProject(UUID tenantId, UUID projectId, CivicProject dto) {
        CivicProject project = projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        project.setProjectId(dto.getProjectId());
        project.setTitle(dto.getTitle());
        project.setStatus(dto.getStatus());
        project.setBudget(dto.getBudget());
        project.setSpent(dto.getSpent());
        project.setStartDate(dto.getStartDate());
        project.setEstimatedEndDate(dto.getEstimatedEndDate());
        project.setCompletionPercentage(dto.getCompletionPercentage());
        return projectRepository.save(project);
    }

    public void deleteProject(UUID tenantId, UUID projectId) {
        CivicProject project = projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        project.setDeleted(true);
        projectRepository.save(project);
    }
}
