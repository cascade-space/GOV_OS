"use client";
import React, { useState, useEffect } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";

const sectorIcons: Record<string, React.ElementType> = {
    roads: Wrench,
    water: Droplets,
    electricity: Zap,
    sanitation: Trash2,
    infrastructure: Building2,
    environment: Trees,
};

export default function ConstituencyPage() {
    const [selectedWard, setSelectedWard] = useState<string>("all");
    const { t } = useLanguage();

    const [metrics, setMetrics] = useState<{
        name: string;
        assemblyNumber: number;
        state: string;
        representativeName: string;
        totalIssues: number;
        resolvedIssues: number;
        resolutionRate: number;
        avgResolutionDays: number;
        activeProjects: number;
        allocatedBudget: string;
        wards: Array<{ id: string; number: number; name: string; totalIssues: number; resolved: number; resolutionRate: number; keyConcern: string }>;
        sectors: Array<{ id: string; name: string; resolved: number; inProgress: number; budget: string }>;
    } | null>(null);

    const [ongoingWorks, setOngoingWorks] = useState<Array<{
        title: string;
        department: string;
        ward: string;
        progress: number;
        targetDate: string;
        status: string;
        beneficiaries: string;
        budget: string;
    }>>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchConstituencyData = async () => {
            const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
            try {
                const [metricsRes, worksRes] = await Promise.all([
                    fetch(`${baseURL}/api/v1/public/constituencies/Dharwad/metrics`, { cache: "no-store" }),
                    fetch(`${baseURL}/api/v1/public/constituencies/Dharwad/ongoing-works`, { cache: "no-store" })
                ]);

                if (metricsRes.ok) {
                    const mData = await metricsRes.json();
                    if (isMounted && mData.data) {
                        setMetrics(mData.data);
                    }
                }
                if (worksRes.ok) {
                    const wData = await worksRes.json();
                    if (isMounted && wData.data) {
                        setOngoingWorks(wData.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load constituency data", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchConstituencyData();
        return () => { isMounted = false; };
    }, []);

    // 6 Key Sectors — dynamic from API or clean zero-state
    const sectors = metrics?.sectors && metrics.sectors.length > 0 ? metrics.sectors : [
        { id: "roads",          name: t("constituency.sectorRoads"),          resolved: 0, inProgress: 0, budget: "₹1.25 Cr" },
        { id: "water",          name: t("constituency.sectorWater"),          resolved: 0, inProgress: 0, budget: "₹62 L"   },
        { id: "electricity",    name: t("constituency.sectorElectricity"),    resolved: 0, inProgress: 0, budget: "₹48 L"   },
        { id: "sanitation",     name: t("constituency.sectorSanitation"),     resolved: 0, inProgress: 0, budget: "₹60 L"   },
        { id: "infrastructure", name: t("constituency.sectorInfrastructure"), resolved: 0, inProgress: 0, budget: "₹38 L"   },
        { id: "environment",    name: t("constituency.sectorEnvironment"),    resolved: 0, inProgress: 0, budget: "₹85 L"   },
    ];

    const wardList = metrics?.wards && metrics.wards.length > 0 ? metrics.wards : DHARWAD_WARDS.map(w => ({
        id: w.id,
        number: w.number,
        name: w.name,
        totalIssues: 0,
        resolved: 0,
        resolutionRate: 0,
        keyConcern: "No pending issues"
    }));

    const filteredWorks = ongoingWorks.filter((w) => {
        if (selectedWard !== "all" && !w.ward.toLowerCase().includes(selectedWard.toLowerCase())) return false;
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
                                <span>{t("constituency.badge")}</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                                {metrics?.name || t("constituency.title")}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                {t("constituency.subtitle")}
                            </p>
                        </div>

                        {/* Constituency Quick Badges */}
                        <div className="grid grid-cols-2 gap-3 self-start md:self-auto text-xs">
                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{t("constituency.coveredWards")}</p>
                                <p className="text-xl font-extrabold text-gray-950 mt-0.5">
                                    {metrics?.wards ? `${metrics.wards.length} Wards` : t("constituency.wardsValue")}
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm text-center">
                                <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">{t("constituency.populationImpact")}</p>
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
                        title={t("constituency.issuesResolved")}
                        value={metrics ? metrics.resolvedIssues.toLocaleString() : "0"}
                        subtitle={t("constituency.issuesResolvedSubtitle")}
                        icon={CheckCircle2}
                        color="green"
                    />
                    <StatCard
                        title={t("constituency.activePublicWorks")}
                        value={metrics ? metrics.activeProjects.toString() : ongoingWorks.length.toString()}
                        subtitle={t("constituency.activePublicWorksSubtitle")}
                        icon={Wrench}
                        color="green"
                    />
                    <StatCard
                        title={t("constituency.avgResponseTime")}
                        value={metrics && metrics.totalIssues > 0 ? `${metrics.avgResolutionDays} Days` : "—"}
                        subtitle={metrics && metrics.totalIssues > 0 ? t("constituency.avgResponseTimeSubtitle") : "Awaiting community reports"}
                        icon={Clock}
                        color="green"
                    />
                    <StatCard
                        title={t("constituency.civicTrustIndex")}
                        value={metrics && metrics.totalIssues > 0 ? `${metrics.resolutionRate}%` : "100%"}
                        subtitle={metrics && metrics.totalIssues > 0 ? t("constituency.civicTrustSubtitle") : "Baseline Civic Health"}
                        icon={Shield}
                        color="purple"
                    />
                </div>

                {/* ── 3. Improvements Across 6 Key Sectors ───────────────────── */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t("constituency.sectoralTransformation")}</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                                {t("constituency.improvementsTitle")}
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">{t("constituency.improvementsSubtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {sectors.map((sector) => {
                            const Icon = sectorIcons[sector.id] || Building2;
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
                                            {sector.budget} {t("constituency.allocated")}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-gray-950 text-base">{sector.name}</h3>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
                                            <div>
                                                <span className="text-gray-400 font-semibold">{t("constituency.resolved")}</span>
                                                <p className="text-sm font-black text-emerald-600">{sector.resolved} {t("constituency.items")}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 font-semibold">{t("constituency.inProgress")}</span>
                                                <p className="text-sm font-bold text-amber-600">{sector.inProgress} {t("constituency.active")}</p>
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
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t("constituency.wardAccountability")}</span>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-950">{t("constituency.wardPerformanceMatrix")}</h2>
                            <p className="text-xs sm:text-sm text-gray-500">{t("constituency.wardPerformanceSubtitle")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {wardList.map((w) => {
                            const rate = w.totalIssues > 0 ? Math.round((w.resolved / w.totalIssues) * 100) : 0;
                            return (
                                <div
                                    key={w.id}
                                    className="p-4 rounded-2xl bg-slate-50/70 border border-gray-200/80 hover:border-emerald-200 hover:bg-emerald-50/20 transition space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-bold">
                                            {t("constituency.ward")} {w.number}
                                        </span>
                                        <span className="text-xs font-extrabold text-emerald-700">
                                            {w.totalIssues > 0 ? `${rate}% ${t("constituency.resolvedPct")}` : "Active"}
                                        </span>
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
                                            <span>{t("constituency.total")}: <strong className="text-gray-800">{w.totalIssues}</strong></span>
                                            <span>{t("constituency.closed")}: <strong className="text-emerald-700 font-bold">{w.resolved}</strong></span>
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
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t("constituency.liveMunicipal")}</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                                {t("constituency.govWorksTitle")}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">{t("constituency.govWorksSubtitle")}</p>
                        </div>

                        {/* Ward Filter */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                            <select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-2xl px-4 py-2.5 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                            >
                                <option value="all">{t("constituency.allWards")}</option>
                                {wardList.map((w) => (
                                    <option key={w.id} value={`Ward ${w.number}`}>
                                        {t("constituency.ward")} {w.number} - {w.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorks.length > 0 ? (
                            filteredWorks.map((work, idx) => (
                                <ProgressCard key={idx} {...work} />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-200/80 p-8 space-y-3">
                                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                                <h3 className="text-base font-bold text-gray-900">No Projects Found</h3>
                                <p className="text-xs text-gray-500">No ongoing infrastructure projects match the selected ward filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
