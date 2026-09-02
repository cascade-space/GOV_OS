"use client";
import React from "react";
import Link from "next/link";
import {
    PlusCircle,
    Search,
    CheckCircle2,
    ShieldCheck,
    Users,
    Building2,
    Clock,
    ArrowRight,
    MapPin,
    Wrench,
    Zap,
    Droplets,
    Trees,
    Activity,
    CheckCircle,
    Sparkles,
    Star,
    Layers,
    ChevronRight,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatCard, ProgressCard } from "@/components/ui/StatCard";
import { DEPARTMENTS, CATEGORIES } from "@/lib/constants";

export default function HomePage() {
    // Verified Recent Resolved Showcase
    const recentResolutions = [
        {
            id: "CP-2026-8941",
            title: "Pothole Remediation & Road Resurfacing",
            ward: "Ward 1 • Saptapur",
            department: "Roads & Public Works",
            resolvedTime: "Resolved 2 hours ago",
            beforeImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&q=80",
            afterImage: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&q=80",
            status: "Verified Completed",
            impact: "Safe transit for 3,400 daily commuters",
        },
        {
            id: "CP-2026-8920",
            title: "Water Main Leakage & Valve Repair",
            ward: "Ward 3 • Line Bazaar",
            department: "Water Supply & Sewerage",
            resolvedTime: "Resolved 4 hours ago",
            beforeImage: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=500&q=80",
            afterImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80",
            status: "Verified Completed",
            impact: "Zero water wastage, clean supply restored",
        },
        {
            id: "CP-2026-8894",
            title: "Smart LED Streetlight Replacement (4 Poles)",
            ward: "Ward 8 • Sadhankeri",
            department: "Street Light Operations",
            resolvedTime: "Resolved yesterday",
            beforeImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80",
            afterImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80",
            status: "Verified Completed",
            impact: "Illuminated pedestrian corridor",
        },
    ];

    // Active Government Work in Progress
    const activeProjects = [
        {
            title: "Kalyan Nagar Underground Stormwater Drain Upgrade",
            department: "Drainage & Irrigation",
            ward: "Ward 2",
            progress: 78,
            targetDate: "Sep 15, 2026",
            status: "Ahead of Schedule",
            beneficiaries: "12,000 residents",
            budget: "₹42.5 Lakhs",
        },
        {
            title: "Kelgeri Lakefront Public Park & Walking Track",
            department: "Parks & Urban Greenery",
            ward: "Ward 5",
            progress: 92,
            targetDate: "Sep 08, 2026",
            status: "Final Verification",
            beneficiaries: "8,500 families",
            budget: "₹65.0 Lakhs",
        },
        {
            title: "Toll Naka to University Road Asphalting",
            department: "Roads & Public Works",
            ward: "Ward 4",
            progress: 64,
            targetDate: "Sep 22, 2026",
            status: "Active Execution",
            beneficiaries: "25,000 daily vehicles",
            budget: "₹88.0 Lakhs",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
            <PublicNavbar />

            {/* ── 1. Hero Section ────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 sm:pt-20 sm:pb-28">
                {/* Background ambient lighting */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        {/* Civic Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-lg shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>GovOS Multi-Tenant Governance Platform</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">Dharwad Municipal Corporation</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                            Together, We Build <br />
                            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                Better Communities.
                            </span>
                        </h1>

                        {/* Supporting Message */}
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                            Report civic issues with photo proof, track real-time government officer action, and witness visible improvements across your neighborhood.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/citizen/report"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition duration-200 group"
                            >
                                <PlusCircle className="w-4 h-4 text-emerald-200 group-hover:rotate-90 transition duration-300" />
                                <span>Report an Issue</span>
                            </Link>

                            <Link
                                href="/citizen/track"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-sm transition duration-200"
                            >
                                <Search className="w-4 h-4 text-blue-400" />
                                <span>Track Progress</span>
                            </Link>

                            <Link
                                href="/constituency"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition duration-200 hover:bg-slate-800/40"
                            >
                                <span>Constituency View</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Hero Metrics Grid ─────────────────────────────────── */}
                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-lg text-center space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">145,200+</h3>
                            <p className="text-xs font-medium text-slate-400">Citizens Connected</p>
                        </div>

                        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-lg text-center space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">98.4%</h3>
                            <p className="text-xs font-medium text-slate-400">Issues Resolved</p>
                        </div>

                        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-lg text-center space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">24</h3>
                            <p className="text-xs font-medium text-slate-400">Departments Connected</p>
                        </div>

                        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 shadow-lg text-center space-y-1">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                                <Star className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">4.8 / 5</h3>
                            <p className="text-xs font-medium text-slate-400">Citizen Satisfaction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. How It Works (4 Steps) ─────────────────────────────────── */}
            <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Transparent & Fast</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How CivicPath Works</h2>
                        <p className="text-sm text-slate-600">
                            From the moment an issue is submitted to verified field resolution, every step is logged and transparent.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Step 1 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-200 space-y-3 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                                01
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Report Your Issue</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Share photos, exact GPS location, ward details, and description in under 60 seconds.
                            </p>
                            <span className="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition duration-200">
                                Citizen Voice <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-200 hover:bg-purple-50/20 transition-all duration-200 space-y-3 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-purple-600/20">
                                02
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Validation & Routing</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                AI duplicate detection & supervisor validation routes the grievance to the right department with SLA.
                            </p>
                            <span className="inline-flex items-center text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition duration-200">
                                Automated Triage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                        </div>

                        {/* Step 3 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-200 hover:bg-amber-50/20 transition-all duration-200 space-y-3 group">
                            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-amber-600/20">
                                03
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Expert Officer Action</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Assigned field engineers arrive on-site, perform maintenance, and capture real-time progress updates.
                            </p>
                            <span className="inline-flex items-center text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition duration-200">
                                Field Execution <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                        </div>

                        {/* Step 4 */}
                        <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200 space-y-3 group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
                                04
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">Resolution & Quality Proof</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Photo evidence is verified, citizen is notified via SMS/WhatsApp, and progress is logged in the public feed.
                            </p>
                            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition duration-200">
                                Verified Closure <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. Community Progress: "See the Difference We're Making" ─── */}
            <section className="py-16 sm:py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Visible Governance</span>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                See the Difference We’re Making
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                                Verified before-and-after resolution proof uploaded by field engineers across Dharwad Municipal Corporation.
                            </p>
                        </div>
                        <Link
                            href="/public/dashboard"
                            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 self-start md:self-end"
                        >
                            <span>Open Public Analytics Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Recently Resolved Cards Grid */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentResolutions.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col"
                            >
                                {/* Before / After Photo Comparison */}
                                <div className="grid grid-cols-2 gap-1 p-2 bg-slate-100">
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                                        <img
                                            src={item.beforeImage}
                                            alt="Before"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                                            Before
                                        </div>
                                    </div>
                                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
                                        <img
                                            src={item.afterImage}
                                            alt="After"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            After
                                        </div>
                                    </div>
                                </div>

                                {/* Card Details */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-500">{item.ward}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                                {item.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            {item.department}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <span className="font-medium text-emerald-700 bg-emerald-50/50 px-2.5 py-1 rounded-md">
                                            {item.impact}
                                        </span>
                                        <span className="text-[11px] text-slate-400">{item.resolvedTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Work in Progress Header */}
                    <div className="mt-16 pt-12 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Government Work in Progress</h3>
                                <p className="text-xs text-slate-500">Active municipal improvement works currently under execution</p>
                            </div>
                            <Link href="/constituency" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View all projects <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {activeProjects.map((p, idx) => (
                                <ProgressCard key={idx} {...p} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. Positive Community Call to Action ──────────────────────── */}
            <section className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        See Something That Needs Attention?
                    </h2>
                    <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
                        Report potholes, broken street lights, water leaks, or garbage accumulation. Your voice drives visible municipal action.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/citizen/report"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition duration-200"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Report an Issue Today</span>
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
