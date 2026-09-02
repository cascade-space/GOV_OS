"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    PlusCircle,
    Search,
    BarChart3,
    MapPin,
    Shield,
    Menu,
    X,
    ChevronDown,
    Globe,
    UserCheck,
    Briefcase,
    Crown,
} from "lucide-react";
import { CITIZEN_NAV } from "@/lib/constants";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function PublicNavbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [portalsOpen, setPortalsOpen] = useState(false);

    const portals = [
        { name: "Citizen Portal", href: "/", icon: UserCheck, desc: "Submit and track personal reports" },
        { name: "Field Officer Portal", href: "/officer/dashboard", icon: Briefcase, desc: "On-ground task resolution & evidence" },
        { name: "MLA Oversight Portal", href: "/mla/dashboard", icon: Crown, desc: "Constituency KPIs & executive directives" },
        { name: "Tenant Admin Console", href: "/admin/dashboard", icon: Building2, desc: "Department workflows & SLA management" },
        { name: "GovOS SuperAdmin", href: "/superadmin/dashboard", icon: Shield, desc: "Multi-tenant master administration" },
    ];


    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition duration-200">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 text-lg tracking-tight">CivicPath</span>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider uppercase">GovOS</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">Digital Civic Governance</p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {CITIZEN_NAV.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        active
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden sm:flex items-center gap-2.5">
                        <LanguageSwitcher />

                        {/* Government Portals Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setPortalsOpen(!portalsOpen)}
                                onBlur={() => setTimeout(() => setPortalsOpen(false), 200)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                <Shield className="w-3.5 h-3.5 text-blue-600" />
                                <span>Gov Portals</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {portalsOpen && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-1.5 border-b border-slate-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Government Stakeholder Views</p>
                                    </div>
                                    {portals.map((p) => {
                                        const Icon = p.icon;
                                        return (
                                            <Link
                                                key={p.href}
                                                href={p.href}
                                                className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition text-left"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                                                    <p className="text-[11px] text-slate-500 leading-tight">{p.desc}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                                        >
                                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                                            <span>Unified Stakeholder Login →</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Primary CTA */}
                        <Link
                            href="/citizen/report"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-xs font-bold shadow-sm shadow-blue-600/20 hover:opacity-95 transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Report an Issue</span>
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex sm:hidden items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-slate-200 py-4 space-y-3">
                        <div className="space-y-1">
                            {CITIZEN_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`block px-3.5 py-2 rounded-xl text-xs font-semibold ${
                                        pathname === item.href
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-1">
                            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stakeholder Portals</p>
                            {portals.map((p) => (
                                <Link
                                    key={p.href}
                                    href={p.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                                >
                                    <span>{p.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/citizen/report"
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Report an Issue
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
