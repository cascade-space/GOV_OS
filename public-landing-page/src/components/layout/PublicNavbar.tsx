"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Shield,
    Menu,
    X,
    ChevronDown,
    UserCircle,
    UserCheck,
    Briefcase,
    Crown,
    Building2,
    MapPin,
    ArrowRight,
} from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function PublicNavbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [portalsOpen, setPortalsOpen] = useState(false);

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Report Issue", href: "/citizen/report" },
        { label: "Track Issue", href: "/citizen/track" },
        { label: "Public Dashboard", href: "/public/dashboard" },
        { label: "Constituency View", href: "/constituency" },
    ];

    const portals = [
        { name: "Citizen Portal", href: "/", icon: UserCheck, desc: "Submit and track personal reports" },
        { name: "Field Officer Portal", href: "/officer/dashboard", icon: Briefcase, desc: "On-ground task resolution & evidence" },
        { name: "MLA Oversight Desk", href: "/mla/dashboard", icon: Crown, desc: "Constituency KPIs & executive directives" },
        { name: "Tenant Admin Console", href: "/admin/dashboard", icon: Building2, desc: "Department workflows & SLA management" },
        { name: "GovOS SuperAdmin", href: "/superadmin/dashboard", icon: Shield, desc: "Multi-tenant master administration" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shadow-sm group-hover:bg-green-700 transition">
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

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        active
                                            ? "bg-green-50 text-green-700 border border-green-200 shadow-xs"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Government Stakeholder Portals Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setPortalsOpen(!portalsOpen)}
                                onBlur={() => setTimeout(() => setPortalsOpen(false), 200)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                <Shield className="w-3.5 h-3.5 text-green-600" />
                                <span>Gov Portals</span>
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            </button>

                            {portalsOpen && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-3 py-1.5 border-b border-gray-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Government Stakeholder Views</p>
                                    </div>
                                    {portals.map((p) => {
                                        const Icon = p.icon;
                                        return (
                                            <Link
                                                key={p.href}
                                                href={p.href}
                                                className="flex items-start gap-3 px-3.5 py-2 hover:bg-gray-50 transition text-left"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                                                    <p className="text-[10px] text-gray-500 leading-tight">{p.desc}</p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    <div className="p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                        >
                                            <Shield className="w-3.5 h-3.5 text-white" />
                                            <span>Unified Stakeholder Login →</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Login Button */}
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition shadow-sm"
                        >
                            <UserCircle className="w-4 h-4" />
                            <span>Login</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-3 space-y-2 bg-white animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block px-3.5 py-2 rounded-xl text-xs font-semibold ${
                                            active
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stakeholder Portals</p>
                            {portals.map((p) => (
                                <Link
                                    key={p.href}
                                    href={p.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    <span>{p.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold shadow-sm hover:bg-green-700 transition"
                            >
                                <UserCircle className="w-4 h-4" />
                                Login to Portal
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
