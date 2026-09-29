"use client";
import { useEffect, useState } from "react";
import { MLALayout } from "@/components/layout/MLALayout";
import { formatDateTime, cn } from "@/lib/utils";
import { MessageSquare, Clock, MapPin, ArrowRight, CheckCircle2, AlertTriangle, PlusCircle, X, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { directiveService, MlaDirective } from "@/lib/services/directive.service";
import { complaintService } from "@/lib/services/complaint.service";
import { useAppStore } from "@/lib/store";

export default function MLADirectivesPage() {
    const { user } = useAppStore();
    const [directives, setDirectives] = useState<any[]>([]);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Directive form state
    const [selectedComplaintId, setSelectedComplaintId] = useState("");
    const [directiveType, setDirectiveType] = useState<any>("EXPEDITE");
    const [instructionNotes, setInstructionNotes] = useState("");

    const fetchDirectivesAndComplaints = async () => {
        try {
            setLoading(true);
            const [dirs, cmps]: [any, any] = await Promise.all([
                directiveService.getDirectives().catch(e => {
                    console.warn("Directives API call:", e);
                    return [];
                }),
                complaintService.getConstituencyComplaints('Dharwad').catch(e => {
                    console.warn("Constituency complaints API call:", e);
                    return [];
                })
            ]);

            const dirList = Array.isArray(dirs) ? dirs : (dirs?.data || []);
            const cmpList = Array.isArray(cmps) ? cmps : (cmps?.data || []);
            setComplaints(cmpList);
            setDirectives(dirList);
        } catch (err) {
            console.error("Failed to load live directives:", err);
            setDirectives([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectivesAndComplaints();
    }, []);

    const handleCreateDirective = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructionNotes.trim()) {
            toast.error("Please enter instruction notes");
            return;
        }

        const targetComplaintId = selectedComplaintId || complaints[0]?.id;
        if (!targetComplaintId) {
            toast.error("No active complaint available to bind directive");
            return;
        }

        setSubmitting(true);
        try {
            await directiveService.issueDirective({
                complaintId: targetComplaintId,
                mlaName: user?.name || "Hon. MLA Representative",
                constituency: "Dharwad",
                directiveType,
                instructionNotes: instructionNotes.trim()
            });

            toast.success("Executive Directive issued and dispatched to department!");
            setIsModalOpen(false);
            setInstructionNotes("");
            fetchDirectivesAndComplaints();
        } catch (err: any) {
            toast.error("Failed to issue directive: " + (err?.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MLALayout>
            <div className="space-y-6 animate-fade-in pb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Directives</h1>
                        <p className="text-gray-500 text-sm">Legislative oversight directives issued to municipal departments for AC-71.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchDirectivesAndComplaints}
                            disabled={loading}
                            className="p-2.5 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-civic-blue' : ''}`} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-civic-blue hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Issue Executive Directive
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {loading && directives.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-8 h-8 border-4 border-civic-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400 text-sm font-medium">Loading executive directives from Core API...</p>
                        </div>
                    ) : directives.length === 0 ? (
                        <div className="civic-card p-12 text-center text-gray-500">
                            No directives currently active. All high-priority issues are monitored in real time.
                        </div>
                    ) : (
                        directives.map((dir) => (
                            <div key={dir.id} className="civic-card p-6 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                                            {dir.directiveType?.substring(0, 3) || 'DIR'}
                                        </span>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base">
                                                Directive: {dir.directiveType || 'EXECUTIVE ACTION'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Issued by {dir.mlaName || 'MLA Representative'} • {dir.constituency || 'Dharwad'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                            ['RESOLVED', 'CLOSED', 'COMPLIANCE_VERIFIED'].includes((dir.status || '').toUpperCase())
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {dir.status || 'IN EXECUTION'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed mb-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                                    {dir.instructionNotes || dir.content}
                                </p>

                                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDateTime(dir.createdAt || dir.date)}
                                        </span>
                                        {dir.complaintNumber && (
                                            <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                Ticket: {dir.complaintNumber}
                                            </span>
                                        )}
                                    </div>
                                    {dir.complaintId && (
                                        <Link 
                                            href={`/mla/issues/${dir.complaintId}`}
                                            className="text-civic-blue font-bold hover:underline flex items-center gap-1"
                                        >
                                            View Related Grievance
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal for Issuing Directive */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-gray-200 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-2 font-black text-gray-950 text-base">
                                    <Shield className="w-5 h-5 text-civic-blue" />
                                    <span>Issue Legislative Executive Directive</span>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateDirective} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Target Complaint / Grievance</label>
                                    <select
                                        value={selectedComplaintId}
                                        onChange={(e) => setSelectedComplaintId(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-civic-blue outline-none"
                                        required
                                    >
                                        <option value="">Select an active complaint...</option>
                                        {complaints.map((c: any) => (
                                            <option key={c.id} value={c.id}>
                                                {c.complaintNumber || c.complaint_number || c.id} — {c.title || 'Civic Issue'} ({c.priority || 'NORMAL'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Directive Classification</label>
                                    <select
                                        value={directiveType}
                                        onChange={(e) => setDirectiveType(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-civic-blue outline-none"
                                    >
                                        <option value="EXPEDITE">EXPEDITE (Accelerate Resolution)</option>
                                        <option value="INSPECT">INSPECT (Deploy Special On-Site Audit)</option>
                                        <option value="REALLOCATE">REALLOCATE (Reassign Resources)</option>
                                        <option value="SPECIAL_AUDIT">SPECIAL_AUDIT (Ministerial Inquiry)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Directive Order & Specific Instructions</label>
                                    <textarea
                                        value={instructionNotes}
                                        onChange={(e) => setInstructionNotes(e.target.value)}
                                        rows={4}
                                        placeholder="Mandate specific execution orders for municipal engineers and field supervisors..."
                                        className="w-full p-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-civic-blue outline-none"
                                        required
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2 rounded-xl bg-civic-blue text-white font-black hover:bg-blue-700 shadow-sm disabled:opacity-50"
                                    >
                                        {submitting ? "Dispatching..." : "Dispatch Directive"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </MLALayout>
    );
}
