"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    MapPin,
    Building2,
    CheckCircle2,
    Clock,
    TrendingUp,
    Shield,
    Droplets,
    Zap,
    Trash2,
    Trees,
    Wrench,
    ArrowUpRight,
    ChevronRight,
    Search,
    Layers,
    SlidersHorizontal,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatCard, ProgressCard } from "@/components/ui/StatCard";
import { DHARWAD_WARDS } from "@/lib/constants";

export default function ConstituencyPage() {
    const [selectedWard, setSelectedWard] = useState<string>("all");
    const [selectedSector, setSelectedSector] = useState<string>("all");

    // 6 Key Sectors
    const sectors = [
        { id: "roads", name: "Roads & Transit", icon: Wrench, resolved: 840, inProgress: 14, budget: "₹1.4 Cr" },
        { id: "water", name: "Water & Sewage", icon: Droplets, resolved: 620, inProgress: 8, budget: "₹95 L" },
        { id: "electricity", name: "Electricity & Power", icon: Zap, resolved: 410, inProgress: 6, budget: "₹45 L" },
        { id: "sanitation", name: "Sanitation & Cleanliness", icon: Trash2, resolved: 980, inProgress: 12, budget: "₹60 L" },
        { id: "infrastructure", name: "Civic Infrastructure", icon: Building2, resolved: 310, inProgress: 9, budget: "₹2.1 Cr" },
        { id: "environment", name: "Parks & Greenery", icon: Trees, resolved: 220, inProgress: 5, budget: "₹35 L" },
    ];

    // Major Ongoing Works in Progress
    const ongoingWorks = [
        {
            title: "Saptapur University Main Road Four-Laning & Asphalting",
            department: "Roads & Public Works",
            ward: "Ward 1 • Saptapur",
            progress: 82,
            targetDate: "Oct 15, 2026",
            status: "Near Completion",
            beneficiaries: "35,000 daily commuters",
            budget: "₹1.25 Cr",
        },
        {
            title: "Kelgeri Lake Rejuvenation, Aerators & Jogging Track",
            department: "Parks & Environment",
            ward: "Ward 5 • Kelgeri",
            progress: 94,
            targetDate: "Sep 20, 2026",
            status: "Final Landscaping",
            beneficiaries: "15,000 residents",
            budget: "₹85.0 L",
        },
        {
            title: "Line Bazaar Underground Drainage Network Modernization",
            department: "Water Supply & Sewerage",
            ward: "Ward 3 • Line Bazaar",
            progress: 68,
            targetDate: "Nov 01, 2026",
            status: "Active Trenching",
            beneficiaries: "8,200 commercial shops",
            budget: "₹62.0 L",
        },
        {
            title: "Navalur Industrial Feeder Line Substation Upgrade",
            department: "Electricity Board (HESCOM)",
            ward: "Ward 7 • Navalur",
            progress: 55,
            targetDate: "Nov 30, 2026",
            status: "Transformer Installation",
            beneficiaries: "140 MSME Units",
            budget: "₹48.0 L",
        },
        {
            title: "Sadhankeri Heritage Park Cultural Open Amphitheater",
            department: "Civic Infrastructure",
            ward: "Ward 8 • Sadhankeri",
            progress: 75,
            targetDate: "Oct 05, 2026",
            status: "Structural Masonry",
            beneficiaries: "All Dharwad Citizens",
            budget: "₹38.0 L",
        },
        {
            title: "Gandhinagar Smart Waste Segregation & Processing Hub",
            department: "Solid Waste Management",
            ward: "Ward 4 • Gandhinagar",
            progress: 88,
            targetDate: "Sep 25, 2026",
            status: "Testing Machinery",
            beneficiaries: "22,000 households",
            budget: "₹55.0 L",
        },
    ];

    const filteredWorks = ongoingWorks.filter((w) => {
        if (selectedWard !== "all" && !w.ward.includes(selectedWard)) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
            <PublicNavbar />

            {/* ── 1. Constituency Overview Header ──────────────────────────── */}
            <div className="bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 border-b border-gray-200/80 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2.5 max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Karnataka Legislative Assembly • Constituency #71</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                                Dharwad Constituency
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Community Progress, Public Infrastructure Improvements & Municipal Service Transparency Portal for the citizens of Dharwad.
                            </p>
                        </div>

                        {/* Constituency Quick Badges */}
                        <div className="grid grid-cols-2 gap-3 self-start md:self-auto text-xs">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Covered Wards</p>
                                <p className="text-xl font-extrabold text-gray-950 mt-0.5">8 Wards</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm text-center">
                                <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Population Impact</p>
                                <p className="text-xl font-extrabold text-emerald-600 mt-0.5">280,000+</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-12">
                {/* ── 2. Top Community Progress KPIs ────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Issues Resolved"
                        value="3,380"
                        subtitle="98.2% completion rate"
                        icon={CheckCircle2}
                        color="green"
                        trend={{ value: "+8%", positive: true, label: "this quarter" }}
                    />
                    <StatCard
                        title="Active Public Works"
                        value="18 Projects"
                        subtitle="₹6.8 Cr ongoing capital works"
                        icon={Wrench}
                        color="green"
                    />
                    <StatCard
                        title="Average Response Time"
                        value="1.4 Days"
                        subtitle="Standard SLA: 3.0 Days"
                        icon={Clock}
                        color="green"
                        trend={{ value: "-45%", positive: true, label: "faster resolution" }}
                    />
                    <StatCard
                        title="Civic Trust Index"
                        value="96.4%"
                        subtitle="Audited citizen satisfaction"
                        icon={Shield}
                        color="purple"
                    />
                </div>

                {/* ── 3. Improvements Across 6 Key Sectors ───────────────────── */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sectoral Transformation</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                                Improvements Across Dharwad
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">Aggregated infrastructure and civic health across key public domains</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sectors.map((sector) => {
                            const Icon = sector.icon;
                            return (
                                <div
                                    key={sector.id}
                                    className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition duration-200 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                                            {sector.budget} Allocated
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-gray-950 text-base">{sector.name}</h3>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
                                            <div>
                                                <span className="text-gray-400 font-semibold">Resolved</span>
                                                <p className="text-sm font-black text-emerald-600">{sector.resolved} items</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 font-semibold">In Progress</span>
                                                <p className="text-sm font-bold text-amber-600">{sector.inProgress} active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── 4. Ward Performance Comparative Matrix ───────────────── */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Ward-Level Accountability</span>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-950">Ward Performance Matrix</h2>
                            <p className="text-xs sm:text-sm text-gray-500">Public aggregated completion and grievance closure rate across 8 wards</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {DHARWAD_WARDS.map((w) => {
                            const rate = Math.round((w.resolved / w.totalIssues) * 100);
                            return (
                                <div
                                    key={w.id}
                                    className="p-4 rounded-2xl bg-slate-50/70 border border-gray-200/80 hover:border-emerald-200 hover:bg-emerald-50/20 transition space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-bold">
                                            Ward {w.number}
                                        </span>
                                        <span className="text-xs font-extrabold text-emerald-700">{rate}% Resolved</span>
                                    </div>

                                    <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">{w.name}</h4>

                                    <div className="space-y-1.5">
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                                                style={{ width: `${rate}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] text-gray-500 pt-0.5 font-medium">
                                            <span>Total: <strong className="text-gray-800">{w.totalIssues}</strong></span>
                                            <span>Closed: <strong className="text-emerald-700 font-bold">{w.resolved}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── 5. Major Government Works in Progress ──────────────────── */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Municipal Execution</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                                Government Works in Progress
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">Major infrastructure and public projects scheduled across Dharwad</p>
                        </div>

                        {/* Ward Filter */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-2xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            >
                                <option value="all">All Wards (Dharwad)</option>
                                {DHARWAD_WARDS.map((w) => (
                                    <option key={w.id} value={`Ward ${w.number}`}>
                                        Ward {w.number} - {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorks.map((work, idx) => (
                            <ProgressCard key={idx} {...work} />
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
