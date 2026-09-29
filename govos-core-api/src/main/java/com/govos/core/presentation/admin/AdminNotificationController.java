package com.govos.core.presentation.admin;

import com.govos.core.domain.complaint.ComplaintStatus;
import com.govos.core.domain.complaint.Priority;
import com.govos.core.infrastructure.persistence.complaint.JpaComplaint;
import com.govos.core.infrastructure.persistence.complaint.SpringDataComplaintRepository;
import com.govos.core.presentation.auth.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller to provide real-time aggregate complaint notification counts for Admin / Portal headers.
 * Route: /api/v1/admin/notifications
 */
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final SpringDataComplaintRepository complaintRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN', 'ROLE_OFFICER', 'ROLE_REP')")
    public ResponseEntity<?> getNotificationCounts(Authentication auth) {
        UUID tenantId = null;
        if (auth != null && auth.getDetails() instanceof JwtAuthFilter.GovOsUserDetails details) {
            tenantId = details.tenantId();
        }

        List<JpaComplaint> complaints;
        if (tenantId != null) {
            complaints = complaintRepository.findByTenantId(tenantId);
        } else {
            complaints = complaintRepository.findAll();
        }

        long newComplaints = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.NEW)
                .count();

        long pendingComplaints = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.NEW 
                        || c.getStatus() == ComplaintStatus.ASSIGNED 
                        || c.getStatus() == ComplaintStatus.IN_PROGRESS
                        || c.getStatus() == ComplaintStatus.REWORK_REQUIRED)
                .count();

        long slaBreached = complaints.stream()
                .filter(JpaComplaint::isSlaBreached)
                .count();

        long highPriorityPending = complaints.stream()
                .filter(c -> (c.getPriority() == Priority.HIGH || c.getPriority() == Priority.CRITICAL) 
                        && c.getStatus() != ComplaintStatus.RESOLVED 
                        && c.getStatus() != ComplaintStatus.CLOSED)
                .count();

        long escalatedComplaints = complaints.stream()
                .filter(c -> c.getEscalationLevel() > 0)
                .count();

        Map<String, Object> data = Map.of(
                "newComplaints", newComplaints,
                "pendingComplaints", pendingComplaints,
                "slaBreached", slaBreached,
                "highPriorityPending", highPriorityPending,
                "escalatedComplaints", escalatedComplaints
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data
        ));
    }
}
