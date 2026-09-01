"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MLA_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
    TrendingUp, MapPin, Download, Share2, LogOut, Menu, X, Bell, MessageSquare
} from "lucide-react";
import { useState } from "react";

const ICONS: Record<string, React.ReactNode> = {
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    MapPin: <MapPin className="w-4 h-4" />,
    MessageSquare: <MessageSquare className="w-4 h-4" />,
};

export function MLALayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <header className="bg-gradient-hero text-white px-5 py-4 shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <Link href="/mla/dashboard" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-black text-base leading-none">CivicPath</p>
                                <p className="text-blue-200 text-xs">MLA Leadership View</p>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1 mx-8">
                        {MLA_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                    pathname === item.href
                                        ? "bg-white/15 text-white shadow-inner"
                                        : "text-blue-100 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {ICONS[item.icon]}
                                    {item.label}
                                </div>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 mr-2">
                            <button className="p-2 hover:bg-white/10 rounded-lg relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-civic-blue" />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 bg-civic-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-card-md">
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share Stats</span>
                        </button>
                        <Link href="/admin/login" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-4 h-4 text-blue-200" />
                        </Link>

                        {/* MLA Portrait - Top Right Corner */}
                        <div className="ml-2 flex items-center gap-3 pl-3 border-l border-white/10">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 leading-none">Your MLA</p>
                                <p className="text-xs font-bold text-white">Shri. Mahesh Tenginkai</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-civic-orange shadow-lg overflow-hidden bg-white shrink-0 transition-transform hover:scale-110">
                                <img
                                    src="/static/mla.jpg"
                                    alt="MLA Portrait"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://ui-avatars.com/api/?name=Mahesh+Tenginkai&background=f97316&color=fff";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 py-2 animate-slide-down border-t border-white/10">
                        {MLA_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold",
                                    pathname === item.href
                                        ? "bg-white/15 text-white"
                                        : "text-blue-100"
                                )}
                            >
                                {ICONS[item.icon]}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-xs font-medium">
                        Managed via Digital Governance Operating System • Constituency Ward 12
                    </p>
                </div>
            </footer>
        </div>
    );
}
