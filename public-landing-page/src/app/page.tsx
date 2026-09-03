"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    CheckCircle2,
    Users,
    Clock,
    ArrowRight,
    Phone,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Globe,
    UserCircle,
    FileText,
    Shield,
    Timer,
    Star,
    Plus,
    Heart,
    Building2,
    TrendingUp,
} from "lucide-react";

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
    const navItems = [
        { label: "Home", href: "/" },
        { label: "Report Issue", href: "/citizen/report" },
        { label: "Track Issue", href: "/citizen/track" },
        { label: "Public Dashboard", href: "/public/dashboard" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-lg font-extrabold text-gray-900 leading-none">
                                <span className="text-green-600">Civic</span>Path
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium">Digital Governance</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = item.href === "/citizen/track";
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                            <Globe className="w-4 h-4" />
                            <span>English</span>
                        </button>
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                        >
                            <UserCircle className="w-4 h-4" />
                            <span>Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function HeroSection() {
    const [trackId, setTrackId] = useState("");
    const router = useRouter();
    const handleTrack = () => {
        if (trackId.trim()) {
            router.push(`/citizen/track?id=${encodeURIComponent(trackId.trim())}`);
        } else {
            router.push("/citizen/track");
        }
    };

    return (
        <section className="relative w-full overflow-hidden flex flex-col justify-between min-h-[660px] lg:min-h-0 lg:aspect-[1600/686] xl:min-h-[720px]">
            {/* Background: herosection.jpg (1600x686) fills whole section without cropping */}
            <img
                src="/herosection.jpg"
                alt="CivicPath community park hero"
                className="absolute inset-0 w-full h-full object-cover object-bottom sm:object-center pointer-events-none select-none"
            />

            {/* ── Top Area: Left Headline & 4 Stat Chips + Right Track Complaint Card ── */}
            <div className="relative z-10 w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 sm:pt-10 md:pt-12">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">

                    {/* ── LEFT: Headline + subtitle + stat chips ── */}
                    <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
                        {/* Headline */}
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] 2xl:text-[74px] font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                                Together, We Build<br />
                                <span className="text-[#16a34a]">Better Communities</span>
                            </h1>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed font-medium max-w-2xl">
                                Report. Track. Resolve. Your voice<br className="hidden sm:inline" /> drives real change in your city.
                            </p>
                        </div>

                        {/* 4 Stat chips in ONE single row - fully visible with no cropping */}
                        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3.5 flex-wrap sm:flex-nowrap pt-1">
                            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 xl:px-4 xl:py-3 shadow-md border border-gray-100/90 shrink-0 hover:shadow-lg transition">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="pr-0.5">
                                    <div className="text-xs sm:text-sm xl:text-base font-black text-gray-900 leading-tight">12,400+</div>
                                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5 whitespace-nowrap">Citizens Connected</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 xl:px-4 xl:py-3 shadow-md border border-gray-100/90 shrink-0 hover:shadow-lg transition">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="pr-0.5">
                                    <div className="text-xs sm:text-sm xl:text-base font-black text-gray-900 leading-tight">2,450+</div>
                                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5 whitespace-nowrap">Issues Resolved</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 xl:px-4 xl:py-3 shadow-md border border-gray-100/90 shrink-0 hover:shadow-lg transition">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="pr-0.5">
                                    <div className="text-xs sm:text-sm xl:text-base font-black text-gray-900 leading-tight">94%</div>
                                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5 whitespace-nowrap">Satisfaction Rate</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 xl:px-4 xl:py-3 shadow-md border border-gray-100/90 shrink-0 hover:shadow-lg transition">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="pr-0.5">
                                    <div className="text-xs sm:text-sm xl:text-base font-black text-gray-900 leading-tight">6</div>
                                    <div className="text-[9px] sm:text-[11px] text-gray-500 font-medium leading-none mt-0.5 whitespace-nowrap">Departments</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Track Your Complaint floating card (Enlarged & Prominent) ── */}
                    <div className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[490px] shrink-0">
                        <div className="bg-white/98 rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 xl:p-8 space-y-4 sm:space-y-5">
                            <div className="text-center space-y-1">
                                <h3 className="text-lg sm:text-xl xl:text-2xl font-extrabold text-gray-900 tracking-tight">Track Your Complaint</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Enter your Complaint ID or registered mobile number</p>
                            </div>
                            <div className="flex gap-2.5">
                                <div className="flex-1 flex items-center gap-2.5 border-2 border-gray-200 rounded-xl px-3.5 py-2.5 sm:py-3 bg-gray-50/80 focus-within:border-emerald-500 focus-within:bg-white transition">
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={trackId}
                                        onChange={(e) => setTrackId(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                                        placeholder="CMP-2024-00341 or 9876543210"
                                        className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
                                    />
                                </div>
                                <button
                                    onClick={handleTrack}
                                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 shadow-md shadow-emerald-600/20 active:scale-95"
                                >
                                    <Search className="w-4 h-4" />
                                    <span>Track</span>
                                </button>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 text-center pt-0.5">
                                Demo: Try{" "}
                                <button onClick={() => setTrackId("CMP-2024-00341")} className="text-emerald-600 font-bold hover:underline">CMP-2024-00341</button>
                                {" "}or{" "}
                                <button onClick={() => setTrackId("CMP-2024-00342")} className="text-emerald-600 font-bold hover:underline">CMP-2024-00342</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Floating Stats Bar (Inside hero section on grass with safe bottom margin) ── */}
            <div className="relative z-10 w-full max-w-[1380px] mx-auto px-4 sm:px-8 pt-10 pb-5 sm:pb-7 xl:pb-8">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 py-4 px-5 sm:px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 items-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        <div className="flex items-center gap-3 px-2">
                            <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                                <div className="text-base sm:text-lg xl:text-xl font-black text-gray-900 leading-tight">3.2 days</div>
                                <div className="text-xs sm:text-sm text-gray-500 font-medium">Avg. Resolution Time</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0">
                            <Users className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                                <div className="text-base sm:text-lg xl:text-xl font-black text-gray-900 leading-tight">12,400+</div>
                                <div className="text-xs sm:text-sm text-gray-500 font-medium">Citizens Served</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                                <div className="text-base sm:text-lg xl:text-xl font-black text-gray-900 leading-tight">1,832</div>
                                <div className="text-xs sm:text-sm text-gray-500 font-medium">Issues Resolved</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0">
                            <Clock className="w-6 h-6 text-amber-500 shrink-0" />
                            <div>
                                <div className="text-base sm:text-lg xl:text-xl font-black text-gray-900 leading-tight">315</div>
                                <div className="text-xs sm:text-sm text-gray-500 font-medium">Active Issues</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
                            <div>
                                <div className="text-base sm:text-lg xl:text-xl font-black text-gray-900 leading-tight">94%</div>
                                <div className="text-xs sm:text-sm text-gray-500 font-medium">Satisfaction Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}



/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
    const steps = [
        {
            num: "01",
            icon: FileText,
            title: "Report Your Issue",
            desc: "Share details, photos, and location in just a few taps.",
            color: "bg-green-100 text-green-700",
            numColor: "text-green-600",
            iconBg: "bg-green-600",
        },
        {
            num: "02",
            icon: Shield,
            title: "AI Validation",
            desc: "Our AI verifies and routes your issue to the right department.",
            color: "bg-blue-100 text-blue-700",
            numColor: "text-blue-600",
            iconBg: "bg-blue-600",
        },
        {
            num: "03",
            icon: UserCircle,
            title: "Expert Assignment",
            desc: "The responsible officer is assigned with a clear SLA deadline.",
            color: "bg-purple-100 text-purple-700",
            numColor: "text-purple-600",
            iconBg: "bg-purple-600",
        },
        {
            num: "04",
            icon: Timer,
            title: "Resolution & Updates",
            desc: "Get real-time updates until the issue is resolved and verified.",
            color: "bg-amber-100 text-amber-700",
            numColor: "text-amber-600",
            iconBg: "bg-amber-500",
        },
    ];

    return (
        <section className="py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-green-600 text-lg">🌿</span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How It Works</h2>
                        <span className="text-green-600 text-lg">🌿</span>
                    </div>
                    <p className="text-sm text-gray-500">Simple steps to a better, cleaner, and stronger community</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <React.Fragment key={i}>
                                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center shrink-0`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`text-2xl font-black ${step.numColor} opacity-80`}>{step.num}</div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute items-center" style={{ left: `calc(${(i + 1) * 25}% - 10px)`, top: "50%", transform: "translateY(-50%)" }}>
                                        <ArrowRight className="w-5 h-5 text-gray-300" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
    return (
        <section className="mx-4 sm:mx-8 lg:mx-16 my-6 rounded-2xl overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-8 gap-6">
                {/* Left: Park illustration mini */}
                <div className="hidden md:flex items-end gap-1 shrink-0">
                    <div className="w-8 h-12 bg-green-600 rounded-t-full" />
                    <div className="w-2 h-5 bg-amber-800" />
                    <div className="w-12 h-16 bg-green-500 rounded-t-full" />
                    <div className="w-2.5 h-6 bg-amber-700" />
                    <div className="w-10 h-10 bg-amber-200 rounded-sm" />
                    <div className="w-2 h-3 bg-amber-700" />
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-extrabold text-gray-900">See something that needs attention?</h3>
                    <p className="text-sm text-gray-600">Report it today and help make your city better for everyone.</p>
                </div>

                <div className="flex gap-3 shrink-0">
                    <Link
                        href="/citizen/report"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition shadow-md shadow-green-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Report Issue
                    </Link>
                    <Link
                        href="/citizen/track"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-green-600 text-green-700 font-bold text-sm hover:bg-green-50 transition"
                    >
                        Track Status
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Right city skyline */}
                <div className="hidden md:flex items-end gap-1 opacity-30 shrink-0">
                    {[40, 60, 45, 80, 55].map((h, i) => (
                        <div key={i} style={{ height: h }} className="w-6 bg-blue-400 rounded-t-sm" />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   RECENTLY RESOLVED
───────────────────────────────────────────── */
function RecentlyResolved() {
    const items = [
        {
            title: "Pothole repaired on Nehru Street",
            category: "Roads",
            ward: "Ward 12",
            time: "2h ago",
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Water supply restored in Block C",
            category: "Water",
            ward: "Ward 7",
            time: "1d ago",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Street lights replaced on MG Road",
            category: "Lighting",
            ward: "Ward 5",
            time: "2d ago",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Garbage bins cleared at Market Road",
            category: "Sanitation",
            ward: "Ward 3",
            time: "3d ago",
            color: "text-teal-600",
            bg: "bg-teal-50",
        },
    ];

    return (
        <section className="py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-extrabold text-gray-900">Recently Resolved</h2>
                    </div>
                    <Link href="/public/dashboard" className="text-sm text-green-600 font-semibold flex items-center gap-1 hover:underline">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-semibold ${item.color}`}>{item.category}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500">{item.ward}</span>
                                <span className="ml-auto text-xs text-gray-400">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-10 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-100">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-extrabold text-gray-900">
                                    <span className="text-green-600">Civic</span>Path
                                </div>
                            </div>
                        </Link>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Empowering citizens to report and track civic issues for a better community.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Quick Links</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/citizen/report" className="hover:text-green-600 transition">Report Issue</Link></li>
                            <li><Link href="/citizen/track" className="hover:text-green-600 transition">Track Complaint</Link></li>
                            <li><Link href="/public/dashboard" className="hover:text-green-600 transition">Public Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Resources</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/" className="hover:text-green-600 transition">How It Works</Link></li>
                            <li><span className="cursor-pointer hover:text-green-600 transition">FAQs</span></li>
                            <li><span className="cursor-pointer hover:text-green-600 transition">Privacy Policy</span></li>
                            <li><span className="cursor-pointer hover:text-green-600 transition">Terms of Service</span></li>
                        </ul>
                    </div>

                    {/* Helpline */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Helpline</h5>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-900">1800-XXX-XXXX (Toll Free)</span>
                            </div>
                            <div className="space-y-0.5 pt-2">
                                <p className="text-xs text-gray-500">Powered by</p>
                                <p className="text-sm font-bold text-green-600">Cascade Technologies Solutions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span>© 2024 CivicPath. All rights reserved.</span>
                    <span className="text-green-500">🌿</span>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1">
                <HeroSection />
                <HowItWorks />
                <CTABanner />
                <RecentlyResolved />
            </main>
            <Footer />
        </div>
    );
}
