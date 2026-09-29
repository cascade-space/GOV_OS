package com.govos.core.application.project;

import com.govos.core.domain.project.CivicProject;
import com.govos.core.domain.project.ProjectRepository;
import com.govos.core.infrastructure.persistence.complaint.SpringDataComplaintRepository;
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
    private final SpringDataComplaintRepository complaintRepository;

    @Transactional(readOnly = true)
    public List<CivicProject> listProjects(UUID tenantId) {
        List<CivicProject> projects = projectRepository.findAllByTenantId(tenantId);
        for (CivicProject project : projects) {
            project.setLinkedComplaintsCount(complaintRepository.countByProjectId(project.getId()));
        }
        return projects;
    }

    @Transactional(readOnly = true)
    public CivicProject getProject(UUID tenantId, UUID projectId) {
        CivicProject project = projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        project.setLinkedComplaintsCount(complaintRepository.countByProjectId(project.getId()));
        return project;
    }

    public CivicProject createProject(UUID tenantId, CivicProject dto) {
        CivicProject project = CivicProject.builder()
                .tenantId(tenantId)
                .projectId(dto.getProjectId() != null ? dto.getProjectId() : "PRJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title(dto.getTitle())
                .status(dto.getStatus() != null ? dto.getStatus() : "PLANNING")
                .budget(dto.getBudget())
                .spent(dto.getSpent() != null ? dto.getSpent() : 0.0)
                .startDate(dto.getStartDate())
                .estimatedEndDate(dto.getEstimatedEndDate())
                .completionPercentage(dto.getCompletionPercentage())
                .wardId(dto.getWardId())
                .departmentId(dto.getDepartmentId())
                .contractorName(dto.getContractorName())
                .beneficiariesDescription(dto.getBeneficiariesDescription())
                .targetDateFormatted(dto.getTargetDateFormatted())
                .sector(dto.getSector() != null ? dto.getSector() : "INFRASTRUCTURE")
                .build();
        return projectRepository.save(project);
    }

    public CivicProject updateProject(UUID tenantId, UUID projectId, CivicProject dto) {
        CivicProject project = projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        project.setProjectId(dto.getProjectId());
        project.setTitle(dto.getTitle());
        project.setStatus(dto.getStatus());
        project.setBudget(dto.getBudget());
        project.setSpent(dto.getSpent());
        project.setStartDate(dto.getStartDate());
        project.setEstimatedEndDate(dto.getEstimatedEndDate());
        project.setCompletionPercentage(dto.getCompletionPercentage());
        project.setWardId(dto.getWardId());
        project.setDepartmentId(dto.getDepartmentId());
        project.setContractorName(dto.getContractorName());
        project.setBeneficiariesDescription(dto.getBeneficiariesDescription());
        project.setTargetDateFormatted(dto.getTargetDateFormatted());
        project.setSector(dto.getSector());
        return projectRepository.save(project);
    }

    public void deleteProject(UUID tenantId, UUID projectId) {
        CivicProject project = projectRepository.findByIdAndTenantId(projectId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));
        project.setDeleted(true);
        projectRepository.save(project);
    }
}
