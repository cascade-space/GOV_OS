package com.govos.core.domain.analytics;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AnalyticsReport {
    private UUID tenantId;
    private int totalComplaints;
    private int resolvedComplaints;
    private double citizenSatisfactionScore;
    private double budgetUtilization;
    private List<Map<String, Object>> complaintTrends; // For charts

    public AnalyticsReport() {}

    public AnalyticsReport(UUID tenantId, int totalComplaints, int resolvedComplaints, double citizenSatisfactionScore, double budgetUtilization, List<Map<String, Object>> complaintTrends) {
        this.tenantId = tenantId;
        this.totalComplaints = totalComplaints;
        this.resolvedComplaints = resolvedComplaints;
        this.citizenSatisfactionScore = citizenSatisfactionScore;
        this.budgetUtilization = budgetUtilization;
        this.complaintTrends = complaintTrends;
    }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public int getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(int totalComplaints) { this.totalComplaints = totalComplaints; }
    public int getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(int resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }
    public double getCitizenSatisfactionScore() { return citizenSatisfactionScore; }
    public void setCitizenSatisfactionScore(double citizenSatisfactionScore) { this.citizenSatisfactionScore = citizenSatisfactionScore; }
    public double getBudgetUtilization() { return budgetUtilization; }
    public void setBudgetUtilization(double budgetUtilization) { this.budgetUtilization = budgetUtilization; }
    public List<Map<String, Object>> getComplaintTrends() { return complaintTrends; }
    public void setComplaintTrends(List<Map<String, Object>> complaintTrends) { this.complaintTrends = complaintTrends; }
}
