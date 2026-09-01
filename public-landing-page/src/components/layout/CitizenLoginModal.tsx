"use client";
import { useState } from "react";
import { X, Phone, KeyRound, Loader2 } from "lucide-react";
import { useLogin } from "@/contexts/LoginContext";
import api from "@/lib/api-client";

export function CitizenLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { login } = useLogin();
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Check if phone matches pattern
            if (!/^\+?[0-9]{10,14}$/.test(phone)) {
                throw new Error("Invalid phone number. Include country code (e.g. +91...)");
            }
            
            await api.post("/auth/public/otp/request", { identifier: phone });
            setStep("otp");
        } catch (err: any) {
            setError(err.message || "Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/otp/verify", {
                identifier: phone,
                otp: otp
            });
            
            // Login context
            login(res.accessToken, res.user);
            onClose();
        } catch (err: any) {
            setError(err.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Citizen Login</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    {step === "phone" ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 9999999999"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue transition-all"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    A 6-digit OTP will be sent to your mobile number.
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-civic-blue text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Request OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue transition-all text-center tracking-widest text-lg font-mono"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-civic-blue text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Verify & Login
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setStep("phone")}
                                className="w-full text-civic-blue text-sm font-medium hover:underline"
                            >
                                Change Mobile Number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
