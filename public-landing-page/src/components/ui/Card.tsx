"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "flat";
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, variant = "default", padding = "md", ...props }: CardProps) {
    const variants = {
        default: "civic-card",
        elevated: "civic-card-elevated",
        flat: "bg-white rounded-2xl border border-gray-100",
    };
    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
    };
    return (
        <div className={cn(variants[variant], paddings[padding], className)} {...props}>
            {children}
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: { value: number; label: string };
    iconBg?: string;
    className?: string;
}

export function KPICard({ title, value, subtitle, icon, trend, iconBg = "bg-navy-50", className }: KPICardProps) {
    return (
        <Card className={cn("hover:shadow-card-md transition-shadow duration-300", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                    {trend && (
                        <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
                            <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
                            <span className="text-gray-400 font-normal">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}
