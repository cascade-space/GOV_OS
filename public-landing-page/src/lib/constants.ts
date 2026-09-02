// ── Status Enums ─────────────────────────────────────────────────────────────
export const COMPLAINT_STATUSES = [
    "submitted",
    "under_review",
    "validated",
    "assigned",
    "in_progress",
    "work_completed",
    "under_verification",
    "quality_check",
    "resolved",
    "verified_completed",
    "closed",
    "rejected",
    "duplicate",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    validated: "Validated",
    assigned: "Assigned",
    in_progress: "Work in Progress",
    work_completed: "Work Completed",
    under_verification: "Under Verification",
    quality_check: "Quality Check",
    resolved: "Verified Completed",
    verified_completed: "Verified Completed",
    closed: "Closed",
    rejected: "Rejected",
    duplicate: "Duplicate",
};

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
    submitted: "bg-slate-100 text-slate-700 border border-slate-300",
    under_review: "bg-blue-50 text-blue-700 border border-blue-200",
    validated: "bg-blue-100 text-blue-800 border border-blue-300",
    assigned: "bg-purple-50 text-purple-700 border border-purple-200",
    in_progress: "bg-amber-50 text-amber-700 border border-amber-300",
    work_completed: "bg-teal-50 text-teal-700 border border-teal-200",
    under_verification: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    quality_check: "bg-indigo-100 text-indigo-800 border border-indigo-300",
    resolved: "bg-emerald-50 text-emerald-700 border border-emerald-300",
    verified_completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    closed: "bg-gray-100 text-gray-700 border border-gray-300",
    rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    duplicate: "bg-amber-100 text-amber-800 border border-amber-200",
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
    low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    high: "bg-orange-50 text-orange-700 border border-orange-200",
    critical: "bg-rose-50 text-rose-700 border border-rose-300",
};

// ── Categories & Sectors ──────────────────────────────────────────────────────
export const CATEGORIES = [
    { value: "roads", label: "Roads & Infrastructure", icon: "Road" },
    { value: "water", label: "Water Supply & Sewage", icon: "Droplets" },
    { value: "electricity", label: "Electricity & Power", icon: "Zap" },
    { value: "sanitation", label: "Sanitation & Waste Management", icon: "Trash2" },
    { value: "street_lighting", label: "Street Lighting", icon: "Lightbulb" },
    { value: "health", label: "Public Health & Safety", icon: "HeartPulse" },
    { value: "parks", label: "Parks & Urban Greenery", icon: "Trees" },
    { value: "drainage", label: "Stormwater Drainage", icon: "Waves" },
    { value: "other", label: "General Civic Services", icon: "Layers" },
] as const;

export const SUB_CATEGORIES: Record<string, string[]> = {
    roads: ["Pothole Repair", "Road Resurfacing", "Footpath Renovation", "Traffic Signal Repair", "Road Markings", "Illegal Encroachment"],
    water: ["Pipeline Leakage Repair", "Low Water Pressure", "Contaminated Water Supply", "New Water Connection", "Water Tanker Request"],
    electricity: ["Street Light Replacement", "Transformer Fault", "Low Hanging Overhead Wires", "Power Fluctuations", "Power Outage"],
    sanitation: ["Door-to-door Garbage Collection", "Overflowing Public Dustbins", "Open Garbage Dumping", "Dead Animal Removal", "Debris Clearance"],
    street_lighting: ["Non-functional Street Light", "Broken Street Light Pole", "Solar Lamp Installation", "Underground Cable Repair"],
    health: ["Mosquito Fogging Request", "Stray Dog Vaccination / Control", "Public Toilet Cleaning", "Vector Disease Reporting", "Food Safety Issue"],
    parks: ["Park Bench / Equipment Repair", "Lawn Maintenance & Pruning", "Park Light Repair", "Jogging Track Maintenance"],
    drainage: ["Blocked Underground Drain", "Broken Drain Cover / Manhole", "Monsoon Waterlogging", "Desilting Required"],
    other: ["Noise Nuisance", "Tree Branch Trimming", "Illegal Banner / Poster Removal", "General Inquiry"],
};

// ── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
    { id: "dept-roads", name: "Roads & Public Works", code: "RPW", slaHours: 120 },
    { id: "dept-water", name: "Water Supply & Sewerage", code: "WSS", slaHours: 48 },
    { id: "dept-electricity", name: "Electricity Distribution (HESCOM)", code: "HES", slaHours: 24 },
    { id: "dept-sanitation", name: "Solid Waste Management", code: "SWM", slaHours: 24 },
    { id: "dept-lighting", name: "Street Light Operations", code: "SLO", slaHours: 48 },
    { id: "dept-health", name: "Public Health & Environment", code: "PHE", slaHours: 72 },
] as const;

// ── Dharwad Constituency Wards ────────────────────────────────────────────────
export const DHARWAD_WARDS = [
    { id: "ward-01", number: 1, name: "Saptapur & University Area", totalIssues: 142, resolved: 135 },
    { id: "ward-02", number: 2, name: "Kalyan Nagar & Malmaddi", totalIssues: 98, resolved: 94 },
    { id: "ward-03", number: 3, name: "Line Bazaar & Old Hubli-Dharwad Road", totalIssues: 210, resolved: 198 },
    { id: "ward-04", number: 4, name: "Gandhinagar & Toll Naka", totalIssues: 165, resolved: 158 },
    { id: "ward-05", number: 5, name: "Kelgeri & Lake Precinct", totalIssues: 87, resolved: 83 },
    { id: "ward-06", number: 6, name: "Hosayellapur & Market Yard", totalIssues: 184, resolved: 172 },
    { id: "ward-07", number: 7, name: "Navalur & Industrial Corridor", totalIssues: 112, resolved: 104 },
    { id: "ward-08", number: 8, name: "Sadhankeri & Cultural Zone", totalIssues: 76, resolved: 73 },
];

// ── Roles ─────────────────────────────────────────────────────────────────────
export const USER_ROLES = [
    "SUPER_ADMIN",
    "TENANT_ADMIN",
    "DEPARTMENT_HEAD",
    "OFFICER",
    "REPRESENTATIVE",
    "CITIZEN",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ── Navigation Constants ──────────────────────────────────────────────────────
export const CITIZEN_NAV = [
    { href: "/", label: "Home" },
    { href: "/citizen/report", label: "Report an Issue" },
    { href: "/citizen/track", label: "Track Progress" },
    { href: "/public/dashboard", label: "Community Progress" },
    { href: "/constituency", label: "Constituency View" },
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


// ── Stepper Steps (8-Stage Complete Governance Journey) ────────────────────────
export const COMPLAINT_LIFECYCLE_STEPS = [
    { key: "submitted", label: "Submitted", description: "Issue received with photo & GPS location" },
    { key: "under_review", label: "Under Review", description: "Automated triage & department validation" },
    { key: "assigned", label: "Assigned", description: "Designated to field response officer" },
    { key: "in_progress", label: "Work in Progress", description: "On-ground execution & materials dispatched" },
    { key: "work_completed", label: "Work Completed", description: "Officer uploaded completion proof & evidence" },
    { key: "under_verification", label: "Under Verification", description: "Supervisor & citizen verification check" },
    { key: "verified_completed", label: "Verified Completed", description: "Quality verified and marked in community progress" },
    { key: "closed", label: "Closed", description: "Resolution certified & archived" },
];

