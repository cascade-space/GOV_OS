export interface ComplaintTrend {
  month: string;
  complaints: number;
  resolved: number;
}

export interface AnalyticsReport {
  tenantId: string;
  // Complaint stats
  totalComplaints: number;
  resolvedComplaints: number;
  resolutionRate: number;
  citizenSatisfactionScore: number;
  budgetUtilization: number;
  complaintTrends: ComplaintTrend[];
  // Infrastructure counts
  activeAssets: number;
  ongoingProjects: number;
  totalDocuments: number;
  registeredCitizens: number;
  activeOfficers: number;
}
