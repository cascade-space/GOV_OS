








"use client";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    MapPin, FileText, Clock, CheckCircle, ChevronRight, ArrowRight,
    Smartphone, Search, Upload, Shield, Zap, Users, Star, TrendingUp
} from "lucide-react";
import { MOCK_STATS } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const TICKER_STATS = [
    { label: "Issues Resolved", value: "1,532" },
    { label: "Active Issues", value: "315" },
    { label: "Avg Resolution Time", value: "3.2 days" },
    { label: "Citizens Served", value: "12,400+" },
    { label: "Satisfaction Rate", value: "94%" },
    { label: "Departments Connected", value: "6" },
];

const HOW_IT_WORKS = [
    {
        step: "01",
        icon: <Smartphone className="w-6 h-6" />,
        title: "Report Your Issue",
        description: "Fill out a simple form with details, photos, and your location. Takes less than 2 minutes.",
        color: "bg-blue-50 text-civic-blue",
    },
    {
        step: "02",
        icon: <Search className="w-6 h-6" />,
        title: "AI Validation",
        description: "Our AI classifies and validates your complaint, assigns it to the right department automatically.",
        color: "bg-orange-50 text-civic-orange",
    },
    {
        step: "03",
        icon: <Users className="w-6 h-6" />,
        title: "Expert Assignment",
        description: "A field officer from the relevant department is assigned with a clear SLA deadline.",
        color: "bg-purple-50 text-purple-600",
    },
    {
        step: "04",
        icon: <CheckCircle className="w-6 h-6" />,
        title: "Track & Resolve",
        description: "Monitor progress in real-time and get notified when your issue is resolved.",
        color: "bg-green-50 text-civic-green",
    },
];

const RECENT_RESOLUTIONS = [
    { id: "CMP-2024-00331", issue: "Pothole repaired on Nehru Street", category: "Roads", daysAgo: 1, ward: "Ward 12" },
    { id: "CMP-2024-00328", issue: "Water supply restored in Block C", category: "Water", daysAgo: 2, ward: "Ward 7" },
    { id: "CMP-2024-00325", issue: "Street lights replaced on MG Road", category: "Lighting", daysAgo: 3, ward: "Ward 5" },
    { id: "CMP-2024-00320", issue: "Garbage bins cleared at Market Road", category: "Sanitation", daysAgo: 4, ward: "Ward 3" },
];

export default function CitizenHome() {
    const { t } = useLanguage();
    const [count, setCount] = useState({ resolved: 0, active: 0 });
    const tickerRef = useRef<HTMLDivElement>(null);

    // Animated counter on load
    useEffect(() => {
        const duration = 1500;
        const steps = 50;
        const interval = duration / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setCount({
                resolved: Math.floor(1532 * progress),
                active: Math.floor(315 * progress),
            });
            if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, []);

    const HOW_IT_WORKS = [
        {
            step: "01",
            icon: <Smartphone className="w-6 h-6" />,
            title: t('home.howItWorks.step1Title'),
            description: t('home.howItWorks.step1Desc'),
            color: "bg-blue-50 text-civic-blue",
        },
        {
            step: "02",
            icon: <Search className="w-6 h-6" />,
            title: t('home.howItWorks.step2Title'),
            description: t('home.howItWorks.step2Desc'),
            color: "bg-orange-50 text-civic-orange",
        },
        {
            step: "03",
            icon: <Users className="w-6 h-6" />,
            title: t('home.howItWorks.step3Title'),
            description: t('home.howItWorks.step3Desc'),
            color: "bg-purple-50 text-purple-600",
        },
        {
            step: "04",
            icon: <CheckCircle className="w-6 h-6" />,
            title: t('home.howItWorks.step4Title'),
            description: t('home.howItWorks.step4Desc'),
            color: "bg-green-50 text-civic-green",
        },
    ];

    return (
        <CitizenLayout>
            {/* ── HERO ── */}
            <section className="bg-gradient-hero text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-128 h-128 rounded-full bg-white opacity-30" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <div className="animate-slide-up">
                            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-100 mb-6 border border-white/20">
                                <Shield className="w-3.5 h-3.5 text-civic-orange" />
                                {t('home.hero.poweredBy')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight text-balance mb-5">
                                {t('home.hero.title')}
                                <span className="text-civic-orange block">{t('home.hero.titleHighlight')}</span>
                            </h1>
                            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg">
                                {t('home.hero.description')}
                            </p>
                        </div>

                        {/* Right — Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            {[
                                { label: t('home.hero.issuesResolved'), value: count.resolved.toLocaleString(), icon: <CheckCircle className="w-6 h-6 text-green-400" />, bg: "bg-white/10" },
                                { label: t('home.hero.activeIssues'), value: count.active.toString(), icon: <Clock className="w-6 h-6 text-orange-400" />, bg: "bg-white/10" },
                                { label: t('home.hero.avgResolution'), value: "3.2 days", icon: <TrendingUp className="w-6 h-6 text-blue-300" />, bg: "bg-white/10" },
                                { label: t('home.hero.satisfactionRate'), value: "94%", icon: <Star className="w-6 h-6 text-yellow-400" />, bg: "bg-white/10" },
                            ].map((s) => (
                                <div key={s.label} className="glass-dark rounded-2xl p-5 text-white">
                                    {s.icon}
                                    <p className="text-2xl font-black mt-2">{s.value}</p>
                                    <p className="text-blue-200 text-xs mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS TICKER ── */}
            <div className="bg-civic-orange overflow-hidden py-2.5">
                <div className="flex animate-ticker whitespace-nowrap">
                    {[...TICKER_STATS, ...TICKER_STATS].map((stat, i) => (
                        <div key={i} className="flex items-center gap-2 px-8 text-white text-sm font-semibold flex-shrink-0">
                            <span className="text-white/70">•</span>
                            <span className="text-white/80">{stat.label}:</span>
                            <span>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── HOW IT WORKS ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="text-center mb-12">
                    <span className="text-civic-orange text-sm font-bold uppercase tracking-wider">{t('home.howItWorks.subtitle')}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">{t('home.howItWorks.title')}</h2>
                    <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                        {t('home.howItWorks.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {HOW_IT_WORKS.map((step, i) => (
                        <div
                            key={step.step}
                            className="civic-card-elevated p-6 group cursor-default animate-slide-up"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color} mb-4`}>
                                {step.icon}
                            </div>
                            <span className="text-4xl font-black text-gray-100 block mb-1">{step.step}</span>
                            <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
                <div className="bg-gradient-civic rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{t('home.cta.title')}</h2>
                            <p className="text-blue-100">{t('home.cta.description')}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <Link href="/citizen/report" className="btn-orange px-6 py-3 rounded-xl text-base">
                                <Upload className="w-4 h-4" />
                                {t('home.cta.reportButton')}
                            </Link>
                            <Link href="/citizen/track" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20 px-6 py-3 rounded-xl text-base">
                                {t('home.cta.trackButton')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── RECENT RESOLUTIONS ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="section-header">
                    <div>
                        <span className="text-civic-green text-sm font-bold uppercase tracking-wider">{t('home.recentResolutions.subtitle')}</span>
                        <h2 className="text-2xl font-black text-gray-900 mt-1">{t('home.recentResolutions.title')}</h2>
                    </div>
                    <Link href="/public" className="btn-ghost text-civic-blue flex items-center gap-1">
                        {t('home.recentResolutions.viewAll')} <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RECENT_RESOLUTIONS.map((item) => (
                        <div key={item.id} className="civic-card p-4 flex items-start gap-3 hover:shadow-card-md transition-shadow">
                            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-civic-green" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.issue}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="badge badge-green text-xs">{item.category}</span>
                                    <span className="text-xs text-gray-400">{t('home.recentResolutions.ward')} {item.ward}</span>
                                    <span className="text-xs text-gray-400 ml-auto">{item.daysAgo}d ago</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </CitizenLayout>
    );
}
