// ── Status Enums ─────────────────────────────────────────────────────────────
export const COMPLAINT_STATUSES = [
    "submitted",
    "validated",
    "assigned",
    "in_progress",
    "quality_check",
    "resolved",
    "closed",
    "rejected",
    "duplicate",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
    submitted: "Submitted",
    validated: "Validated",
    assigned: "Assigned",
    in_progress: "In Progress",
    quality_check: "Quality Check",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
    duplicate: "Duplicate",
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
    submitted: "badge-gray",
    validated: "badge-blue",
    assigned: "badge-purple",
    in_progress: "badge-orange",
    quality_check: "bg-cyan-100 text-cyan-700",
    resolved: "badge-green",
    closed: "bg-gray-200 text-gray-700",
    rejected: "badge-red",
    duplicate: "badge-yellow",
};

// ── Priority Enums ────────────────────────────────────────────────────────────
export const PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
    low: "badge-green",
    medium: "badge-yellow",
    high: "badge-orange",
    critical: "badge-red",
};

// ── Categories ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
    { value: "roads", label: "Roads & Public Works" },
    { value: "water", label: "Water Supply" },
    { value: "electricity", label: "Electricity" },
    { value: "sanitation", label: "Sanitation & Waste" },
    { value: "street_lighting", label: "Street Lighting" },
    { value: "health", label: "Health & Safety" },
    { value: "parks", label: "Parks & Recreation" },
    { value: "drainage", label: "Drainage & Flooding" },
    { value: "other", label: "Other" },
] as const;

export const SUB_CATEGORIES: Record<string, string[]> = {
    roads: ["Pothole", "Road Cave-in", "Broken Footpath", "Traffic Signal Issue", "Road Markings", "Encroachment"],
    water: ["No Water Supply", "Low Pressure", "Pipeline Leakage", "Contaminated Water", "Meter Issue"],
    electricity: ["Power Outage", "Street Light Faulty", "Transformer Issue", "Dangerous Wiring", "Meter Problem"],
    sanitation: ["Garbage Not Collected", "Overflowing Bin", "Sewage Overflow", "Drain Blocked", "Open Defecation"],
    street_lighting: ["Light Not Working", "Light Pole Damaged", "New Light Required", "Wiring Exposed"],
    health: ["Mosquito Breeding", "Stray Animals", "Food Adulteration", "Hospital Issue", "Pollution"],
    parks: ["Damaged Equipment", "Encroachment", "Broken Benches", "Maintenance Issue"],
    drainage: ["Flooded Road", "Blocked Drain", "Sewage Leaking", "Open Manhole"],
    other: ["Noise Complaint", "Illegal Construction", "Tree Cutting", "Other"],
};

// ── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
    { id: "dept-roads", name: "Roads & Public Works", code: "RPW", slaHours: 168 },
    { id: "dept-water", name: "Water Supply", code: "WS", slaHours: 48 },
    { id: "dept-electricity", name: "Electricity Board", code: "EB", slaHours: 24 },
    { id: "dept-sanitation", name: "Sanitation Department", code: "SD", slaHours: 72 },
    { id: "dept-lighting", name: "Street Lighting", code: "SL", slaHours: 48 },
    { id: "dept-health", name: "Health & Safety", code: "HS", slaHours: 72 },
] as const;

// ── Roles ─────────────────────────────────────────────────────────────────────
export const USER_ROLES = ["citizen", "ops_desk", "supervisor", "field_officer", "dept_liaison", "mla_office", "mla"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── Nav Items ─────────────────────────────────────────────────────────────────
export const CITIZEN_NAV = [
    { href: "/citizen", label: "Home" },
    { href: "/citizen/report", label: "Report Issue" },
    { href: "/citizen/track", label: "Track Issue" },
    { href: "/public", label: "Public Dashboard" },
];

export const ADMIN_NAV = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/admin/complaints", label: "Complaints", icon: "FileText" },
    { href: "/admin/analytics", label: "Analytics", icon: "BarChart2" },
    { href: "/admin/announcements", label: "Announcements", icon: "Megaphone" },
    { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export const OFFICER_NAV = [
    { href: "/officer/dashboard", label: "My Tasks", icon: "CheckSquare" },
    { href: "/officer/history", label: "History", icon: "Clock" },
    { href: "/officer/profile", label: "Profile", icon: "User" },
];

export const MLA_NAV = [
    { href: "/mla/dashboard", label: "Executive View", icon: "TrendingUp" },
    { href: "/mla/issues", label: "Issue Overview", icon: "MapPin" },
    { href: "/mla/directives", label: "Directives", icon: "MessageSquare" },
];

// ── SLA Defaults (hours) ──────────────────────────────────────────────────────
export const SLA_DEFAULTS: Record<string, number> = {
    roads: 168, // 7 days
    water: 48,
    electricity: 24,
    sanitation: 72,
    street_lighting: 48,
    health: 72,
    critical: 4,
    high: 24,
    medium: 72,
    low: 168,
};

// ── Stepper Steps ─────────────────────────────────────────────────────────────
export const COMPLAINT_LIFECYCLE_STEPS = [
    { key: "submitted", label: "Submitted", description: "Your complaint has been received" },
    { key: "validated", label: "Validated", description: "Complaint reviewed and confirmed" },
    { key: "assigned", label: "Assigned", description: "Assigned to the relevant department" },
    { key: "in_progress", label: "In Progress", description: "Field team is working on it" },
    { key: "quality_check", label: "Quality Check", description: "Resolution being verified" },
    { key: "resolved", label: "Resolved", description: "Issue has been resolved" },
];
