"use client";
import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        positive: boolean;
        label: string;
    };
    color?: "blue" | "green" | "orange" | "purple" | "navy";
    className?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "green",
    className = "",
}: StatCardProps) {
    const colorStyles = {
        blue: {
            iconBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
            border: "hover:border-emerald-300",
        },
        green: {
            iconBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
            border: "hover:border-emerald-300",
        },
        orange: {
            iconBg: "bg-amber-50 text-amber-600 border-amber-100",
            border: "hover:border-amber-300",
        },
        purple: {
            iconBg: "bg-purple-50 text-purple-600 border-purple-100",
            border: "hover:border-purple-300",
        },
        navy: {
            iconBg: "bg-slate-900 text-slate-100 border-slate-700",
            border: "hover:border-slate-400",
        },
    };

    const currentStyle = colorStyles[color];

    return (
        <div
            className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${currentStyle.border} ${className}`}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">{value}</h3>
                </div>
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${currentStyle.iconBg}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {(subtitle || trend) && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
                    {trend && (
                        <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                                trend.positive ? "text-emerald-600" : "text-rose-600"
                            }`}
                        >
                            {trend.positive ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                            {trend.value} <span className="text-slate-400 font-normal ml-0.5">{trend.label}</span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

interface ProgressCardProps {
    title: string;
    department: string;
    ward: string;
    progress: number;
    targetDate: string;
    status: string;
    beneficiaries?: string;
    budget?: string;
}

export function ProgressCard({
    title,
    department,
    ward,
    progress,
    targetDate,
    status,
    beneficiaries,
    budget,
}: ProgressCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition duration-200 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                            {ward}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-emerald-700">{department}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{title}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap">
                    {status}
                </span>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Project Execution</span>
                    <span className="text-emerald-700 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Target: <strong className="text-slate-700 font-semibold">{targetDate}</strong></span>
                {budget && <span>Budget: <strong className="text-slate-700 font-semibold">{budget}</strong></span>}
                {beneficiaries && <span>Impact: <strong className="text-slate-700 font-semibold">{beneficiaries}</strong></span>}
            </div>
        </div>
    );
}
