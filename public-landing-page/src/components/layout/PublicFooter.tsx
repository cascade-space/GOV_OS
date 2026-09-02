"use client";
import React from "react";
import Link from "next/link";
import { Building2, Shield, Heart, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

export function PublicFooter() {
    return (
        <footer className="bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
                    {/* Brand & Vision */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-white font-black text-xl tracking-tight">CivicPath</span>
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">GovOS</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                            GovOS is a next-generation multi-tenant civic governance operating system empowering citizens, field officers, and administrators to build better, transparent communities together.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Positive Civic Action
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-blue-400">
                                100% SLA Audited
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Citizen Platform</h5>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/" className="hover:text-white transition">Public Home</Link></li>
                            <li><Link href="/citizen/report" className="hover:text-white transition">Report an Issue</Link></li>
                            <li><Link href="/citizen/track" className="hover:text-white transition">Track Community Progress</Link></li>
                            <li><Link href="/public/dashboard" className="hover:text-white transition">Community Dashboard</Link></li>
                            <li><Link href="/constituency" className="hover:text-white transition">Dharwad Constituency</Link></li>
                        </ul>
                    </div>

                    {/* Stakeholder Portals */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Stakeholder Consoles</h5>
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/officer/dashboard" className="hover:text-white transition">Field Officer Portal</Link></li>
                            <li><Link href="/mla/dashboard" className="hover:text-white transition">MLA Oversight Desk</Link></li>
                            <li><Link href="/admin/dashboard" className="hover:text-white transition">Tenant Administrator</Link></li>
                            <li><Link href="/superadmin/dashboard" className="hover:text-white transition">GovOS SuperAdmin</Link></li>
                            <li><Link href="/desk/dashboard" className="hover:text-white transition">Operations Desk</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Helplines */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Civic Helpline</h5>
                        <div className="space-y-2 text-xs text-slate-400">
                            <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Toll-Free: <strong>1800-425-CIVIC</strong></span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-blue-400" />
                                <span>helpdesk@govos.gov.in</span>
                            </p>
                            <p className="flex items-start gap-2 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>Municipal Corporation HQ, Dharwad, Karnataka 580001</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                    <p>© 2026 GovOS Civic Technology. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="hover:text-slate-400 cursor-pointer">Privacy & Citizen Data Shield</span>
                        <span className="hover:text-slate-400 cursor-pointer">Citizen Charter</span>
                        <span className="hover:text-slate-400 cursor-pointer">Terms of Governance</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
