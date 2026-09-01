export interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  user: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}
