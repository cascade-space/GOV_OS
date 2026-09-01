package com.govos.core.application.analytics;

import com.govos.core.domain.asset.AssetRepository;
import com.govos.core.domain.complaint.ComplaintRepository;
import com.govos.core.domain.document.DocumentRepository;
import com.govos.core.domain.project.ProjectRepository;
import com.govos.core.domain.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AssetRepository assetRepository;
    private final ProjectRepository projectRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;

    /**
     * Returns the full analytics report expected by the React frontend AnalyticsReport type.
     * Fields:
     *   tenantId, totalComplaints, resolvedComplaints, citizenSatisfactionScore,
     *   budgetUtilization, complaintTrends[], activeAssets, ongoingProjects,
     *   totalDocuments, registeredCitizens, activeOfficers
     */
    public Map<String, Object> getSummary(UUID tenantId) {
        Map<String, Object> report = new LinkedHashMap<>();

        // Tenant ID
        report.put("tenantId", tenantId.toString());

        // Complaint stats
        long totalComplaints = complaintRepository.countByTenantId(tenantId);
        long resolvedComplaints = complaintRepository.countResolvedByTenantId(tenantId);
        report.put("totalComplaints", totalComplaints);
        report.put("resolvedComplaints", resolvedComplaints);

        // Resolution rate as percentage (safe division)
        double resolutionRate = totalComplaints > 0
                ? Math.round((resolvedComplaints * 100.0) / totalComplaints)
                : 0.0;
        report.put("resolutionRate", resolutionRate);

        // Citizen satisfaction score — placeholder until a ratings table is added
        // Derives a proxy score: 5.0 * (resolutionRate / 100) capped to 2 decimals
        double satisfactionScore = Math.round(5.0 * resolutionRate / 100.0 * 100.0) / 100.0;
        report.put("citizenSatisfactionScore", satisfactionScore);

        // Budget utilization — aggregate spent/budget across all projects for this tenant
        List<com.govos.core.domain.project.CivicProject> projects = projectRepository.findAllByTenantId(tenantId);
        double totalBudget = projects.stream()
                .mapToDouble(p -> p.getBudget() != null ? p.getBudget().doubleValue() : 0)
                .sum();
        double totalSpent = projects.stream()
                .mapToDouble(p -> p.getSpent() != null ? p.getSpent().doubleValue() : 0)
                .sum();
        double budgetUtilization = totalBudget > 0
                ? Math.round((totalSpent / totalBudget) * 100.0)
                : 0.0;
        report.put("budgetUtilization", budgetUtilization);

        // Monthly trend data for the last 6 months
        List<Object[]> rawTrends = complaintRepository.getMonthlyTrend(tenantId);
        List<Map<String, Object>> trends = new ArrayList<>();
        for (Object[] row : rawTrends) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("month", row[0] != null ? row[0].toString() : "");
            point.put("complaints", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            point.put("resolved", row[2] != null ? ((Number) row[2]).longValue() : 0L);
            trends.add(point);
        }
        report.put("complaintTrends", trends);

        // Infrastructure counts
        report.put("activeAssets", assetRepository.countByTenantId(tenantId));
        report.put("ongoingProjects", projectRepository.countByTenantId(tenantId));
        report.put("totalDocuments", documentRepository.countByTenantId(tenantId));
        report.put("registeredCitizens", userRepository.countByTenantIdAndRoleCode(tenantId, "CITIZEN"));
        report.put("activeOfficers", userRepository.countByTenantIdAndRoleCode(tenantId, "OFFICER"));

        return report;
    }
}
