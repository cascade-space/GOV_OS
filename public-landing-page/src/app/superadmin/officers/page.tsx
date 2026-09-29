"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Users, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SuperAdminOfficersRedirect() {
    const router = useRouter();

    return (
        <SuperAdminLayout>
            <div className="max-w-2xl mx-auto py-16 text-center space-y-5">
                <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Users className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                        GovOS Delegated Administration Notice
                    </span>
                    <h2 className="text-xl font-black text-gray-900">
                        Municipal Field Officers are Managed Locally
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
                        In accordance with the GovOS multi-tenant governance philosophy, Field Officers and municipal workforce are created and managed by the respective <span className="font-semibold text-gray-700">Municipal Commissioner (Tenant Admin)</span> and Department Heads.
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-gray-800">Statewide Super Admin Authority</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Super Admins inspect workforce allocation and SLA performance across municipal corporations via the <span className="font-semibold text-slate-800">City Operations Inspector</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                    <Link
                        href="/superadmin/inspector"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-sm transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Open City Inspector
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
