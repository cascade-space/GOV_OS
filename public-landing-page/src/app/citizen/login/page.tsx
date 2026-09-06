"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ShieldCheck, 
    Phone, 
    KeyRound, 
    ArrowRight, 
    Sparkles, 
    Loader2, 
    CheckCircle2, 
    ArrowLeft,
    Shield
} from "lucide-react";
import { useLogin } from "@/contexts/LoginContext";
import api from "@/lib/api-client";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function CitizenLoginPage() {
    const router = useRouter();
    const { login } = useLogin();
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const formatPhone = (val: string) => {
        let cleaned = val.trim().replace(/\s+/g, "");
        if (!cleaned.startsWith("+")) {
            cleaned = "+91" + cleaned.replace(/^0+/, "");
        }
        return cleaned;
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const formatted = formatPhone(phone);
            if (!/^\+[0-9]{11,14}$/.test(formatted)) {
                throw new Error("Please enter a valid 10-digit mobile number");
            }

            try {
                await api.post("/auth/public/otp/request", { identifier: formatted });
            } catch (err) {
                console.warn("API request handled in mock dev mode:", err);
            }

            setStep("otp");
        } catch (err: any) {
            setError(err.message || "Failed to request OTP code");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const formatted = formatPhone(phone);
            let resUser: any = {
                id: "citizen-" + Date.now(),
                phone: formatted,
                name: "Verified Citizen",
                role: "CITIZEN"
            };
            let token = "citizen_jwt_" + Date.now();

            try {
                const res = await api.post("/auth/otp/verify", {
                    identifier: formatted,
                    otp: otp.trim()
                }) as any;
                if (res?.accessToken) {
                    token = res.accessToken;
                    resUser = {
                        id: res.user?.id || "citizen-" + Date.now(),
                        phone: res.user?.phone || formatted,
                        fullName: res.user?.fullName || "Verified Citizen",
                        role: "CITIZEN"
                    };
                }
            } catch (verifyErr: any) {
                if (otp.trim() === "123456") {
                    resUser.role = "CITIZEN";
                } else {
                    throw new Error(verifyErr.response?.data?.message || "Invalid OTP code. Please enter 123456.");
                }
            }

            login(token, resUser);
            router.push("/citizen/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to verify OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    
                    {/* Brand / Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20 mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Citizen Verification Portal
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                            Sign in with your mobile number to view live status and track all your filed civic complaints.
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                        {/* Demo Mode Notification */}
                        <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-green-50/80 border border-green-200/80 rounded-2xl text-xs text-green-900">
                            <Sparkles className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="font-bold">Instant Access:</strong> Enter any 10-digit number & OTP <span className="font-mono bg-green-200/60 px-1.5 py-0.5 rounded font-bold">123456</span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200/80 font-medium leading-relaxed">
                                {error}
                            </div>
                        )}

                        {step === "phone" ? (
                            <form onSubmit={handleRequestOtp} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="98765 43210"
                                            className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-hidden"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-2">
                                        We will send a 6-digit one-time code to verify your identity.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !phone.trim()}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-green-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Get Verification Code</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Verification Code
                                        </label>
                                        <span className="text-xs text-gray-500 font-mono font-medium">{phone}</span>
                                    </div>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-mono font-bold tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-hidden"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-green-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Verify & Access Dashboard</span>
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setStep("phone"); setOtp(""); }}
                                        className="text-green-600 text-xs font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        <span>Change mobile number</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Additional Quick Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <Link href="/citizen/track" className="hover:text-green-600 font-medium">
                                Track by Complaint ID
                            </Link>
                            <Link href="/login" className="hover:text-green-600 font-medium flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Gov Officials Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
