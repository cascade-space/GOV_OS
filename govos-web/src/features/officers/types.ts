export interface Officer {
  id: string;
  tenantId: string;
  userId: string;
  fullName: string;
  department: string;
  designation: string;
  assignedWardId?: string;
  currentWorkload: number;
  isAvailable: boolean;
}
