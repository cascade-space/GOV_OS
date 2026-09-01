"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Save, Bell, Shield, Clock, AlertTriangle, Mail, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const SECTIONS = ["General", "Notifications", "SLA Rules", "Security", "Integrations"];

export default function AdminSettingsPage() {
    const [activeSection, setActiveSection] = useState("General");
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        municipalityName: "Bengaluru Municipal Corporation",
        ward: "Ward 12 — Rajajinagar",
        contactEmail: "admin@civic.gov.in",
        helplineNumber: "1800-XXX-XXXX",
        smsEnabled: true,
        whatsappEnabled: true,
        emailEnabled: false,
        escalationHours: 48,
        criticalSlaHours: 24,
        highSlaHours: 72,
        mediumSlaHours: 168,
        lowSlaHours: 336,
        twoFactorAuth: true,
        sessionTimeout: 60,
        loginAttempts: 5,
    });

    const update = (key: string, val: any) => setSettings((prev) => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
        toast.success("Settings saved successfully!");
    };

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Settings</h2>
                        <p className="text-gray-500 text-sm">Configure the platform to your municipality's needs</p>
                    </div>
                    <Button onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    {/* Sidebar Nav */}
                    <div className="civic-card p-3 h-fit lg:col-span-1">
                        {SECTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setActiveSection(s)}
                                className={cn(
                                    "w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-1 last:mb-0",
                                    activeSection === s ? "bg-civic-blue text-white shadow-card" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Content Panel */}
                    <div className="civic-card p-6 lg:col-span-3 space-y-6">
                        {/* ── General ── */}
                        {activeSection === "General" && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">General Settings</h3>
                                <div>
                                    <label className="label-field">Municipality / Corporation Name</label>
                                    <input value={settings.municipalityName} onChange={(e) => update("municipalityName", e.target.value)} className="input-field" />
                                </div>
                                <div>
                                    <label className="label-field">Default Ward / Constituency</label>
                                    <input value={settings.ward} onChange={(e) => update("ward", e.target.value)} className="input-field" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Admin Contact Email</label>
                                        <input type="email" value={settings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label-field">Helpline Number</label>
                                        <input value={settings.helplineNumber} onChange={(e) => update("helplineNumber", e.target.value)} className="input-field" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Notifications ── */}
                        {activeSection === "Notifications" && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Notification Channels</h3>
                                {[
                                    { key: "smsEnabled", label: "SMS Notifications", icon: <Smartphone className="w-4 h-4 text-blue-500" />, desc: "Send status updates to citizens via SMS" },
                                    { key: "whatsappEnabled", label: "WhatsApp Notifications", icon: <Smartphone className="w-4 h-4 text-green-500" />, desc: "Send messages via WhatsApp Business API" },
                                    { key: "emailEnabled", label: "Email Notifications", icon: <Mail className="w-4 h-4 text-gray-500" />, desc: "Send notifications via email" },
                                ].map(({ key, label, icon, desc }) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-card">{icon}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                                <p className="text-xs text-gray-400">{desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => update(key, !settings[key as keyof typeof settings])}
                                            className={cn("w-12 h-6 rounded-full relative transition-colors", settings[key as keyof typeof settings] ? "bg-civic-green" : "bg-gray-300")}
                                        >
                                            <span className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-card transition-transform", settings[key as keyof typeof settings] ? "translate-x-6" : "translate-x-0.5")} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── SLA Rules ── */}
                        {activeSection === "SLA Rules" && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">SLA Configuration</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">Changes to SLA rules will apply to new complaints only. Existing complaints will retain their original deadlines.</p>
                                </div>
                                {[
                                    { key: "criticalSlaHours", label: "Critical Priority SLA", color: "text-red-600" },
                                    { key: "highSlaHours", label: "High Priority SLA", color: "text-orange-600" },
                                    { key: "mediumSlaHours", label: "Medium Priority SLA", color: "text-yellow-600" },
                                    { key: "lowSlaHours", label: "Low Priority SLA", color: "text-green-600" },
                                    { key: "escalationHours", label: "Auto-Escalation Threshold", color: "text-civic-blue" },
                                ].map(({ key, label, color }) => (
                                    <div key={key} className="grid grid-cols-2 gap-4 items-center">
                                        <label className={cn("text-sm font-semibold", color)}>{label}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={settings[key as keyof typeof settings] as number}
                                                onChange={(e) => update(key, parseInt(e.target.value))}
                                                className="input-field text-center"
                                                min={1}
                                            />
                                            <span className="text-sm text-gray-400 whitespace-nowrap">hours</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Security ── */}
                        {activeSection === "Security" && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Security Settings</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-card">
                                            <Shield className="w-4 h-4 text-civic-blue" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                                            <p className="text-xs text-gray-400">Require OTP on every admin login</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => update("twoFactorAuth", !settings.twoFactorAuth)}
                                        className={cn("w-12 h-6 rounded-full relative transition-colors", settings.twoFactorAuth ? "bg-civic-green" : "bg-gray-300")}
                                    >
                                        <span className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-card transition-transform", settings.twoFactorAuth ? "translate-x-6" : "translate-x-0.5")} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-field">Session Timeout (minutes)</label>
                                        <input type="number" value={settings.sessionTimeout} onChange={(e) => update("sessionTimeout", e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label-field">Max Login Attempts</label>
                                        <input type="number" value={settings.loginAttempts} onChange={(e) => update("loginAttempts", e.target.value)} className="input-field" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Integrations ── */}
                        {activeSection === "Integrations" && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">External Integrations</h3>
                                {[
                                    { name: "Google Maps API", status: "connected", key: "AIzaSy...XXXX", color: "badge-green" },
                                    { name: "Twilio SMS Gateway", status: "connected", key: "SK...XXXX", color: "badge-green" },
                                    { name: "AWS S3 (Media Storage)", status: "connected", key: "AKIA...XXXX", color: "badge-green" },
                                    { name: "WhatsApp Business API", status: "pending", key: "Not configured", color: "badge-orange" },
                                    { name: "PayGov Payment Gateway", status: "disconnected", key: "Not connected", color: "badge-red" },
                                ].map((intg) => (
                                    <div key={intg.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-card">
                                                <Globe className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{intg.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{intg.key}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("badge", intg.color)}>{intg.status}</span>
                                            <Button size="sm" variant="ghost">Configure</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
