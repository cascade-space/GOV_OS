import { ComplaintStatus, Priority, PRIORITY_LABELS, STATUS_LABELS } from "./constants";

// ── Date & Time ───────────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function timeAgo(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
}

// ── SLA Calculations ──────────────────────────────────────────────────────────
export function getSLAStatus(
    deadline: string | Date | null,
    options?: { isBreached?: boolean; escalationLevel?: number; isWarning?: boolean }
): {
    label: string;
    color: string;
    bg: string;
    isBreached: boolean;
    isWarning: boolean;
    hoursLeft: number;
} {
    if (!deadline) return { label: "No SLA", color: "text-gray-400", bg: "bg-gray-50", isBreached: false, isWarning: false, hoursLeft: 0 };

    const now = new Date();
    const sla = new Date(deadline);
    const diffMs = sla.getTime() - now.getTime();
    const hoursLeft = Math.floor(diffMs / 3600000);

    const isBreached = options?.isBreached || hoursLeft < 0;
    const escalationLevel = options?.escalationLevel || 0;

    if (escalationLevel >= 2) {
        return {
            label: "🔥 Level 2 Escalated (Commissioner)",
            color: "text-purple-700",
            bg: "bg-purple-100 border border-purple-300",
            isBreached: true,
            isWarning: false,
            hoursLeft,
        };
    }

    if (isBreached) {
        return {
            label: `🚨 Breached (L1 Dept Head)`,
            color: "text-red-700",
            bg: "bg-red-100 border border-red-300",
            isBreached: true,
            isWarning: false,
            hoursLeft,
        };
    }

    if (options?.isWarning || hoursLeft <= 4) {
        return {
            label: `⚠️ SLA At Risk (${hoursLeft}h left)`,
            color: "text-amber-800",
            bg: "bg-amber-100 border border-amber-300",
            isBreached: false,
            isWarning: true,
            hoursLeft,
        };
    }

    if (hoursLeft < 24) {
        return {
            label: `${hoursLeft}h left`,
            color: "text-orange-700",
            bg: "bg-orange-50 border border-orange-200",
            isBreached: false,
            isWarning: false,
            hoursLeft,
        };
    }

    const daysLeft = Math.floor(hoursLeft / 24);
    return {
        label: `${daysLeft}d left`,
        color: "text-emerald-700",
        bg: "bg-emerald-50 border border-emerald-200",
        isBreached: false,
        isWarning: false,
        hoursLeft,
    };
}

// ── Complaint Number Generator (client-side preview) ─────────────────────────
export function generateComplaintNumber(year?: number, sequence?: number): string {
    const y = year ?? new Date().getFullYear();
    const seq = sequence ?? Math.floor(Math.random() * 9000 + 1000);
    return `CMP-${y}-${String(seq).padStart(5, "0")}`;
}

// ── Label Helpers ─────────────────────────────────────────────────────────────
export function getStatusLabel(status: ComplaintStatus): string {
    return STATUS_LABELS[status] ?? status;
}

export function getPriorityLabel(priority: Priority): string {
    return PRIORITY_LABELS[priority] ?? priority;
}

// ── Class Name Merge ──────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

// ── Number Formatting ─────────────────────────────────────────────────────────
export function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

// ── Truncate ──────────────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + "…";
}

// ── Random ID ─────────────────────────────────────────────────────────────────
export function randomId(): string {
    return Math.random().toString(36).substring(2, 10);
}

// ── Priority suggestion ───────────────────────────────────────────────────────
export function suggestPriority(description: string, category: string): Priority {
    const critical = ["sewage overflow", "electric shock", "water contamination", "fire", "collapse", "accident"];
    const high = ["no power", "flooding", "no water", "broken pipe", "road cave", "dangerous"];
    const medium = ["pothole", "garbage", "drain", "light not working", "pipeline"];

    const text = (description + " " + category).toLowerCase();
    if (critical.some((k) => text.includes(k))) return "critical";
    if (high.some((k) => text.includes(k))) return "high";
    if (medium.some((k) => text.includes(k))) return "medium";
    return "low";
}
