import { z } from 'zod';
import { BaseEntity } from '../../types';

export type ComplaintStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WORK_COMPLETED' | 'RESOLVED' | 'CLOSED' | 'REOPENED' | 'DUPLICATE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Complaint extends BaseEntity {
  complaintNumber: string;
  tenantId: string;
  reporterId: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  wardId?: string;
  assignedToId?: string;
  aiAssessedAt?: string;
  reporterName?: string;
  reporterMobile?: string;
  source?: string;
  subCategory?: string;
  locationAddress?: string;
  resolutionNotes?: string;
  resolutionEvidenceUrl?: string;
  workStartedAt?: string;
  workCompletedAt?: string;
  resolvedAt?: string;
  slaDeadline?: string;
  slaBreached?: boolean;
  slaWarningSent?: boolean;
  escalationLevel?: number;
}

export interface MlaDirective {
  id: string;
  tenantId: string;
  complaintId: string;
  mlaName: string;
  constituency: string;
  directiveType: string;
  instructionNotes: string;
  status: string;
  createdAt: string;
}

export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  latitude: z.number(),
  longitude: z.number(),
});

export type CreateComplaintRequest = z.infer<typeof CreateComplaintSchema>;
