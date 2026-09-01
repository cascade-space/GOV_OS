export interface CivicProject {
  id: string;
  tenantId: string;
  projectId: string;
  title: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED' | string;
  budget: number;
  spent: number;
  startDate: string;
  estimatedEndDate: string;
  completionPercentage: number;
}
