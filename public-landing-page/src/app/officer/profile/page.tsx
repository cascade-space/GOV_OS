"use client";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { MOCK_OFFICERS } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, Building2, Shield, Settings, Award, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function OfficerProfilePage() {
    const officer = MOCK_OFFICERS[0]; // Demo
    const [saving, setSaving] = useState(false);

    const handleUpdate = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        toast.success("Profile updated successfully");
    };

    return (
        <OfficerLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-xl font-black text-gray-900">My Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your details and view achievements</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Stats & Badges */}
                    <div className="space-y-6">
                        <div className="civic-card p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-civic rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-50">
                                <span className="text-2xl font-black text-white">{officer.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{officer.name}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{officer.department}</p>

                            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-blue-600 font-bold">Performance</span>
                                    <span className="text-sm font-black text-civic-blue">{officer.performanceScore}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-civic-blue rounded-full" style={{ width: `${officer.performanceScore}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="civic-card p-5">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Achievements</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "SLA Champion", icon: <Award className="w-4 h-4 text-yellow-500" />, sub: "98% compliance rate" },
                                    { label: "Rapid Responder", icon: <Award className="w-4 h-4 text-blue-500" />, sub: "Solved 10 tasks in a week" },
                                    { label: "Citizen Favorite", icon: <Award className="w-4 h-4 text-civic-green" />, sub: "High satisfaction score" },
                                ].map(badge => (
                                    <div key={badge.label} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{badge.icon}</div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{badge.label}</p>
                                            <p className="text-[10px] text-gray-400">{badge.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Personal Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-6">Personal Information</h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input value={officer.name} readOnly className="input-field pl-10 bg-gray-50 cursor-not-allowed opacity-70" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-field">Department</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input value={officer.department} readOnly className="input-field pl-10 bg-gray-50 cursor-not-allowed opacity-70" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input defaultValue={officer.mobile} className="input-field pl-10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-field">Work Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input defaultValue={officer.email} className="input-field pl-10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleUpdate} loading={saving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                                        Update Details
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-4">Security & Preferences</h3>
                            <div className="divide-y divide-gray-50">
                                {[
                                    { title: "Push Notifications", desc: "Receive alerts for new tasks", status: true },
                                    { title: "Two-Factor Auth", desc: "Add security layer to login", status: false },
                                    { title: "Daily Summary", desc: "Receive morning task overview", status: true },
                                ].map(item => (
                                    <div key={item.title} className="py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                            <p className="text-xs text-gray-400">{item.desc}</p>
                                        </div>
                                        <div className={cn(
                                            "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                                            item.status ? "bg-civic-green" : "bg-gray-200"
                                        )}>
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all",
                                                item.status ? "right-0.5" : "left-0.5"
                                            )} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </OfficerLayout>
    );
}
