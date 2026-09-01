"use client";
import { cn } from "@/lib/utils";
import { ComplaintStatus, Priority, STATUS_COLORS, PRIORITY_COLORS, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "blue" | "orange" | "green" | "red" | "gray" | "purple" | "yellow" | "cyan";
    className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
    const variants = {
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
        green: "bg-green-100 text-green-700",
        red: "bg-red-100 text-red-700",
        gray: "bg-gray-100 text-gray-600",
        purple: "bg-purple-100 text-purple-700",
        yellow: "bg-yellow-100 text-yellow-700",
        cyan: "bg-cyan-100 text-cyan-700",
    };
    return (
        <span className={cn("badge", variants[variant], className)}>{children}</span>
    );
}

export function StatusBadge({ status }: { status: ComplaintStatus }) {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
    return <span className={cn("badge", colorClass)}>{STATUS_LABELS[status] || status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
    const colorClass = PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-600";
    const icons: Record<Priority, string> = {
        low: "↓",
        medium: "→",
        high: "↑",
        critical: "⚡",
    };
    return (
        <span className={cn("badge", colorClass)}>
            {icons[priority]} {PRIORITY_LABELS[priority]}
        </span>
    );
}
