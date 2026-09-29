package com.govos.core.presentation.project;

import com.govos.core.application.project.ProjectService;
import com.govos.core.domain.project.CivicProject;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private static final UUID DEFAULT_TENANT_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    @GetMapping("/public")
    public ResponseEntity<List<CivicProject>> listPublicProjects(@RequestParam(required = false) UUID tenantId) {
        UUID effectiveTenant = tenantId != null ? tenantId : DEFAULT_TENANT_ID;
        return ResponseEntity.ok(projectService.listProjects(effectiveTenant));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA', 'ROLE_REP')")
    public ResponseEntity<List<CivicProject>> listProjects(Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(projectService.listProjects(tenantId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD', 'ROLE_OFFICER', 'ROLE_MLA', 'ROLE_REP')")
    public ResponseEntity<CivicProject> getProject(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(projectService.getProject(tenantId, id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<CivicProject> createProject(@RequestBody CivicProject dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(projectService.createProject(tenantId, dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<CivicProject> updateProject(@PathVariable UUID id, @RequestBody CivicProject dto, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        return ResponseEntity.ok(projectService.updateProject(tenantId, id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_DEPT_HEAD')")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id, Authentication auth) {
        var details = (JwtAuthFilter.GovOsUserDetails) auth.getDetails();
        UUID tenantId = details.tenantId();
        projectService.deleteProject(tenantId, id);
        return ResponseEntity.noContent().build();
    }
}
