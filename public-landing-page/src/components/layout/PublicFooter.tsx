"use client";
import React from "react";
import Link from "next/link";
import { Shield, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function PublicFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-100">
                    {/* Brand & Socials */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-sm group-hover:bg-green-700 transition">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="font-extrabold text-gray-900 leading-tight">
                                    <span className="text-green-600">Civic</span>Path
                                </div>
                                <div className="text-[9px] text-gray-400 font-medium">Digital Governance</div>
                            </div>
                        </Link>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                            Empowering citizens to report and track civic issues for a cleaner, transparent, and responsive community.
                        </p>
                        <div className="flex items-center gap-2.5">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition">
                                <Facebook className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-black hover:border-gray-300 transition">
                                <Twitter className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition">
                                <Instagram className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                                <Youtube className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Quick Links</h5>
                        <ul className="space-y-2 text-xs text-gray-600">
                            <li><Link href="/citizen/report" className="hover:text-green-600 transition">Report Issue</Link></li>
                            <li><Link href="/citizen/track" className="hover:text-green-600 transition">Track Complaint</Link></li>
                            <li><Link href="/public/dashboard" className="hover:text-green-600 transition">Public Dashboard</Link></li>
                            <li><Link href="/constituency" className="hover:text-green-600 transition">Constituency View</Link></li>
                        </ul>
                    </div>

                    {/* Resources & Portals */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Stakeholder Consoles</h5>
                        <ul className="space-y-2 text-xs text-gray-600">
                            <li><Link href="/officer/dashboard" className="hover:text-green-600 transition">Field Officer Portal</Link></li>
                            <li><Link href="/mla/dashboard" className="hover:text-green-600 transition">MLA Oversight Desk</Link></li>
                            <li><Link href="/admin/dashboard" className="hover:text-green-600 transition">Tenant Administrator</Link></li>
                            <li><Link href="/superadmin/dashboard" className="hover:text-green-600 transition">GovOS SuperAdmin</Link></li>
                            <li><Link href="/login" className="hover:text-green-600 transition font-medium text-green-700">Unified Portal Login →</Link></li>
                        </ul>
                    </div>

                    {/* Helpline & Platform Details */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-extrabold text-gray-900">Civic Helpline</h5>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                                <span className="text-xs font-bold text-gray-900">1800-425-CIVIC (Toll Free)</span>
                            </div>
                            <div className="space-y-0.5 pt-2">
                                <p className="text-[11px] text-gray-500">Powered by</p>
                                <p className="text-xs font-bold text-green-600">Cascade Technologies Solutions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Bar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center sm:text-left">
                    <p>© 2026 CivicPath — GovOS Technology. All rights reserved. 🌿</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 text-[11px]">
                        <span className="hover:text-gray-600 cursor-pointer transition">Privacy Policy</span>
                        <span className="hover:text-gray-600 cursor-pointer transition">Citizen Charter</span>
                        <span className="hover:text-gray-600 cursor-pointer transition">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
