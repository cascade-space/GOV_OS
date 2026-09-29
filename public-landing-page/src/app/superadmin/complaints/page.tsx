"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { FileText, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SuperAdminComplaintsRedirect() {
    const router = useRouter();

    return (
        <SuperAdminLayout>
            <div className="max-w-2xl mx-auto py-16 text-center space-y-5">
                <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <FileText className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                        GovOS Municipal Boundary Notice
                    </span>
                    <h2 className="text-xl font-black text-gray-900">
                        Grievances are Inspected via City Operations Inspector
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
                        In GovOS, complaints belong to specific municipal tenants and wards. Super Admin maintains strictly read-only supervisory access through the <span className="font-semibold text-gray-700">City Operations Inspector</span> without disrupting the city department audit trail.
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-gray-800">Tenant Operational Isolation</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Mutation, reassignments, and resolution proof submissions are performed exclusively by Municipal Tenant Staff and Field Engineers.
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
                        Open City Operations Inspector
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
