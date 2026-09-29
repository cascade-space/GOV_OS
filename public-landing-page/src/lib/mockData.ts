// ── Data Interfaces & Clean Collections (Zero Mock Data) ─────────────────────────

export interface Complaint {
    id: string;
    complaintNumber: string;
    citizenName: string;
    citizenMobile: string;
    title: string;
    description: string;
    category: string;
    subCategory: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "submitted" | "validated" | "assigned" | "in_progress" | "quality_check" | "resolved" | "closed" | "rejected" | "duplicate";
    locationAddress: string;
    ward: string;
    latitude: number;
    longitude: number;
    assignedDept: string;
    assignedOfficer: string;
    slaDeadline: string;
    isEscalated: boolean;
    aiCategorySuggestion: string;
    aiUrgencyScore: number;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    mediaCount: number;
}

export const MOCK_COMPLAINTS: Complaint[] = [];

export interface Officer {
    id: string;
    name: string;
    mobile: string;
    email: string;
    department: string;
    activeCases: number;
    resolvedTotal: number;
    performanceScore: number;
    isActive: boolean;
}

export const MOCK_OFFICERS: Officer[] = [];

export const MOCK_STATS = {
    totalIssues: 0,
    resolvedThisMonth: 0,
    pending: 0,
    slaBreached: 0,
    avgResolutionDays: 0,
    citizenSatisfaction: 0,
};

export const MOCK_TREND_DATA: { date: string; submitted: number; resolved: number }[] = [];

export interface Department {
    id: string;
    name: string;
    code: string;
    slaHours: number;
    isActive: boolean;
    totalCases: number;
    resolvedCases: number;
}

export const MOCK_DEPARTMENTS: Department[] = [];

export const MOCK_CATEGORY_DATA: { name: string; value: number; color: string }[] = [];

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    category: "Alert" | "Work" | "Event";
    status: "active" | "expired";
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [];
