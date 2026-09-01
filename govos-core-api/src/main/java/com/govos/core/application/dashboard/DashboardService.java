package com.govos.core.application.dashboard;

import com.govos.core.domain.auth.UserRepository;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.complaint.ComplaintStatus;
import com.govos.core.presentation.auth.JwtAuthFilter;
import com.govos.core.presentation.dashboard.dto.DashboardSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public DashboardSummary getSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getDetails() instanceof JwtAuthFilter.GovOsUserDetails details)) {
            throw new IllegalStateException("Not authenticated properly");
        }

        UUID tenantId = details.tenantId();
        UUID userId = details.userId();
        String role = details.role();

        Map<String, Object> metrics = new HashMap<>();

        switch (role) {
            case "SUPER_ADMIN" -> {
                metrics.put("totalTenants", 0); // Placeholder until TenantRepository exists
                metrics.put("systemHealth", "GREEN");
            }
            case "TENANT_ADMIN" -> {
                metrics.put("totalComplaints", complaintRepository.countByTenantId(tenantId));
                metrics.put("resolvedComplaints", complaintRepository.countResolvedByTenantId(tenantId));
                metrics.put("pendingComplaints", complaintRepository.countByTenantIdAndStatus(tenantId, ComplaintStatus.NEW) + 
                                                 complaintRepository.countByTenantIdAndStatus(tenantId, ComplaintStatus.ASSIGNED));
                metrics.put("activeOfficers", userRepository.countByTenantIdAndRoleCode(tenantId, "OFFICER"));
                metrics.put("activeCitizens", userRepository.countByTenantIdAndRoleCode(tenantId, "CITIZEN"));
            }
            case "OFFICER" -> {
                metrics.put("myTotalAssigned", complaintRepository.countByAssignedToId(userId));
                metrics.put("myPendingTasks", complaintRepository.countByAssignedToIdAndStatus(userId, ComplaintStatus.ASSIGNED) + 
                                              complaintRepository.countByAssignedToIdAndStatus(userId, ComplaintStatus.IN_PROGRESS));
                metrics.put("myResolved", complaintRepository.countByAssignedToIdAndStatus(userId, ComplaintStatus.RESOLVED));
            }
            default -> {
                metrics.put("message", "No specific dashboard for role: " + role);
            }
        }

        return new DashboardSummary(role, metrics);
    }
}
