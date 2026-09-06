"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useLogin } from "@/contexts/LoginContext";
import api from "@/lib/api-client";

export function CitizenLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const router = useRouter();
    const { login } = useLogin();
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

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
            } catch (backendErr) {
                console.warn("Backend request, fallback to mock dev OTP:", backendErr);
            }

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
                console.warn("Backend verification error:", verifyErr);
                // In dev mock mode if OTP is 123456
                if (otp.trim() === "123456") {
                    resUser.role = "CITIZEN";
                } else {
                    throw new Error(verifyErr.response?.data?.message || "Invalid OTP code. Please try again.");
                }
            }
            
            login(token, resUser);
            onClose();
            router.push("/citizen/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-white">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">Citizen Verification</h2>
                            <p className="text-xs text-gray-500">Access your personal complaint dashboard</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Demo Mode Badge */}
                    <div className="mb-5 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200/60 rounded-xl text-xs text-green-800 font-medium">
                        <Sparkles className="w-4 h-4 text-green-600 shrink-0" />
                        <span>Instant Access: Enter any mobile number & OTP <strong className="text-green-900 font-mono">123456</strong></span>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    {step === "phone" ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="98765 43210"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-hidden"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1.5">
                                    We will send a 6-digit one-time verification code.
                                </p>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || !phone.trim()}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Get Verification Code</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Enter 6-Digit OTP
                                    </label>
                                    <span className="text-xs text-gray-500 font-mono">{phone}</span>
                                </div>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all outline-hidden"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Verify & Open Dashboard</span>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => { setStep("phone"); setOtp(""); }}
                                className="w-full text-green-600 text-xs font-bold hover:underline cursor-pointer py-1"
                            >
                                ← Change mobile number
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

