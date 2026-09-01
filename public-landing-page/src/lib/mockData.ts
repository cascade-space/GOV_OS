// ── Mock Data for Demo (replace with real API calls) ─────────────────────────

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

export const MOCK_COMPLAINTS: Complaint[] = [
    {
        id: "c1",
        complaintNumber: "CMP-2024-00341",
        citizenName: "Ramesh Kumar",
        citizenMobile: "9876543210",
        title: "Large pothole on MG Road near bus stop",
        description: "There is a large pothole on MG Road near the main bus stop causing accidents. Vehicles are getting damaged and there is risk to life. The pothole is approximately 2 feet wide and 6 inches deep.",
        category: "roads",
        subCategory: "Pothole",
        priority: "high",
        status: "in_progress",
        locationAddress: "MG Road, Near Bus Stop, Ward 12",
        ward: "Ward 12",
        latitude: 12.9716,
        longitude: 77.5946,
        assignedDept: "Roads & Public Works",
        assignedOfficer: "Suresh Patil",
        slaDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        isEscalated: false,
        aiCategorySuggestion: "roads",
        aiUrgencyScore: 0.78,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        resolvedAt: null,
        mediaCount: 3,
    },
    {
        id: "c2",
        complaintNumber: "CMP-2024-00342",
        citizenName: "Priya Sharma",
        citizenMobile: "9123456789",
        title: "No water supply for 3 days in Block B",
        description: "There has been no water supply in Block B of Rajiv Nagar for the past 3 days. Residents are struggling and buying water cans at high cost. Pipeline seems to be broken.",
        category: "water",
        subCategory: "No Water Supply",
        priority: "critical",
        status: "assigned",
        locationAddress: "Rajiv Nagar, Block B, Ward 7",
        ward: "Ward 7",
        latitude: 12.968,
        longitude: 77.589,
        assignedDept: "Water Supply",
        assignedOfficer: "Anand Rao",
        slaDeadline: new Date(Date.now() - 86400000).toISOString(),
        isEscalated: true,
        aiCategorySuggestion: "water",
        aiUrgencyScore: 0.95,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        resolvedAt: null,
        mediaCount: 1,
    },
    {
        id: "c3",
        complaintNumber: "CMP-2024-00339",
        citizenName: "Mohammed Ali",
        citizenMobile: "9654321098",
        title: "Street lights not working on entire stretch",
        description: "All street lights on the 500m stretch of Park Avenue are non-functional. This has been a safety hazard especially for women and children walking at night.",
        category: "street_lighting",
        subCategory: "Light Not Working",
        priority: "medium",
        status: "resolved",
        locationAddress: "Park Avenue, Ward 5",
        ward: "Ward 5",
        latitude: 12.975,
        longitude: 77.598,
        assignedDept: "Street Lighting",
        assignedOfficer: "Kiran Babu",
        slaDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        isEscalated: false,
        aiCategorySuggestion: "street_lighting",
        aiUrgencyScore: 0.55,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        resolvedAt: new Date(Date.now() - 86400000).toISOString(),
        mediaCount: 2,
    },
    {
        id: "c4",
        complaintNumber: "CMP-2024-00345",
        citizenName: "Sunita Devi",
        citizenMobile: "9087654321",
        title: "Overflowing garbage bins near market",
        description: "The garbage bins near the vegetable market have been overflowing for 5 days. The smell is unbearable and there are flies everywhere creating health hazards for shoppers and residents.",
        category: "sanitation",
        subCategory: "Overflowing Bin",
        priority: "high",
        status: "validated",
        locationAddress: "Vegetable Market, Ward 3",
        ward: "Ward 3",
        latitude: 12.96,
        longitude: 77.58,
        assignedDept: "",
        assignedOfficer: "",
        slaDeadline: new Date(Date.now() + 86400000).toISOString(),
        isEscalated: false,
        aiCategorySuggestion: "sanitation",
        aiUrgencyScore: 0.7,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        resolvedAt: null,
        mediaCount: 4,
    },
    {
        id: "c5",
        complaintNumber: "CMP-2024-00343",
        citizenName: "Vijay Nair",
        citizenMobile: "9765432109",
        title: "Power outage affecting entire colony",
        description: "Complete power outage in Laxmi Colony for the past 6 hours. Transformer seems to have blown. Elderly patients on medical equipment are at risk.",
        category: "electricity",
        subCategory: "Power Outage",
        priority: "critical",
        status: "submitted",
        locationAddress: "Laxmi Colony, Ward 9",
        ward: "Ward 9",
        latitude: 12.982,
        longitude: 77.601,
        assignedDept: "",
        assignedOfficer: "",
        slaDeadline: new Date(Date.now() + 3600000 * 4).toISOString(),
        isEscalated: false,
        aiCategorySuggestion: "electricity",
        aiUrgencyScore: 0.98,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        resolvedAt: null,
        mediaCount: 0,
    },
];

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

export const MOCK_OFFICERS: Officer[] = [
    { id: "o1", name: "Suresh Patil", mobile: "9876543211", email: "suresh.patil@civic.gov", department: "Roads & Public Works", activeCases: 5, resolvedTotal: 42, performanceScore: 86, isActive: true },
    { id: "o2", name: "Anand Rao", mobile: "9876543212", email: "anand.rao@civic.gov", department: "Water Supply", activeCases: 3, resolvedTotal: 38, performanceScore: 92, isActive: true },
    { id: "o3", name: "Kiran Babu", mobile: "9876543213", email: "kiran.babu@civic.gov", department: "Street Lighting", activeCases: 7, resolvedTotal: 55, performanceScore: 78, isActive: true },
    { id: "o4", name: "Deepa Menon", mobile: "9876543214", email: "deepa.menon@civic.gov", department: "Sanitation Department", activeCases: 4, resolvedTotal: 61, performanceScore: 94, isActive: true },
    { id: "o5", name: "Rajesh Gowda", mobile: "9876543215", email: "rajesh.gowda@civic.gov", department: "Electricity Board", activeCases: 6, resolvedTotal: 29, performanceScore: 71, isActive: false },
];

export const MOCK_STATS = {
    totalIssues: 1847,
    resolvedThisMonth: 312,
    pending: 234,
    slaBreached: 18,
    avgResolutionDays: 3.2,
    citizenSatisfaction: 78,
};

export const MOCK_TREND_DATA = [
    { date: "Jan 24", submitted: 145, resolved: 132 },
    { date: "Feb 24", submitted: 178, resolved: 155 },
    { date: "Mar 24", submitted: 201, resolved: 189 },
    { date: "Apr 24", submitted: 165, resolved: 171 },
    { date: "May 24", submitted: 220, resolved: 198 },
    { date: "Jun 24", submitted: 189, resolved: 201 },
    { date: "Jul 24", submitted: 245, resolved: 223 },
    { date: "Aug 24", submitted: 312, resolved: 289 },
];

export interface Department {
    id: string;
    name: string;
    code: string;
    slaHours: number;
    isActive: boolean;
    totalCases: number;
    resolvedCases: number;
}

export const MOCK_DEPARTMENTS: Department[] = [
    { id: "dept-roads", name: "Roads & Public Works", code: "RPW", slaHours: 168, isActive: true, totalCases: 150, resolvedCases: 138 },
    { id: "dept-water", name: "Water Supply", code: "WS", slaHours: 48, isActive: true, totalCases: 95, resolvedCases: 88 },
    { id: "dept-electricity", name: "Electricity Board", code: "EB", slaHours: 24, isActive: true, totalCases: 72, resolvedCases: 61 },
    { id: "dept-sanitation", name: "Sanitation Department", code: "SD", slaHours: 72, isActive: true, totalCases: 130, resolvedCases: 121 },
    { id: "dept-lighting", name: "Street Lighting", code: "SL", slaHours: 48, isActive: true, totalCases: 64, resolvedCases: 59 },
    { id: "dept-health", name: "Health & Safety", code: "HS", slaHours: 72, isActive: false, totalCases: 28, resolvedCases: 25 },
];

export const MOCK_CATEGORY_DATA = [
    { name: "Roads", value: 32, color: "#1e3a5f" },
    { name: "Water", value: 21, color: "#2563eb" },
    { name: "Sanitation", value: 18, color: "#f97316" },
    { name: "Electricity", value: 15, color: "#f59e0b" },
    { name: "Street Lighting", value: 9, color: "#16a34a" },
    { name: "Other", value: 5, color: "#6b7280" },
];

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    category: "Alert" | "Work" | "Event";
    status: "active" | "expired";
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: "1", title: "Heavy Rain Alert", content: "Expected heavy rains in Ward 12 for the next 48 hours. Please stay indoors if possible.", date: "Feb 20, 2024", category: "Alert", status: "active" },
    { id: "2", title: "Road Repair: MG Road", content: "Patchwork started on MG Road. Traffic diversions in place near the bus stop.", date: "Feb 18, 2024", category: "Work", status: "active" },
    { id: "3", title: "Cleanliness Drive", content: "Join our weekend cleanliness drive at Central Park this Sunday at 8:00 AM.", date: "Feb 15, 2024", category: "Event", status: "expired" },
];
