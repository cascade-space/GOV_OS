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
export function getSLAStatus(deadline: string | Date | null): {
    label: string;
    color: string;
    isBreached: boolean;
    hoursLeft: number;
} {
    if (!deadline) return { label: "No SLA", color: "text-gray-400", isBreached: false, hoursLeft: 0 };

    const now = new Date();
    const sla = new Date(deadline);
    const diffMs = sla.getTime() - now.getTime();
    const hoursLeft = Math.floor(diffMs / 3600000);

    if (hoursLeft < 0) {
        return {
            label: `Breached ${Math.abs(hoursLeft)}h ago`,
            color: "text-red-600",
            isBreached: true,
            hoursLeft,
        };
    }
    if (hoursLeft < 4) {
        return { label: `${hoursLeft}h left`, color: "text-red-500", isBreached: false, hoursLeft };
    }
    if (hoursLeft < 24) {
        return { label: `${hoursLeft}h left`, color: "text-orange-500", isBreached: false, hoursLeft };
    }
    const daysLeft = Math.floor(hoursLeft / 24);
    return { label: `${daysLeft}d left`, color: "text-green-600", isBreached: false, hoursLeft };
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
