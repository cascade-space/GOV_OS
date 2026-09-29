"use client";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, AlertTriangle, RotateCcw } from "lucide-react";
import { CITIZEN_LIFECYCLE_STEPS, ComplaintStatus } from "@/lib/constants";

interface StepperProps {
    currentStatus: string;
    className?: string;
    reworkReason?: string;
}

function getStatusStepIndex(status: string): number {
    const s = (status || "").toLowerCase();
    switch (s) {
        case "new":
        case "submitted":
            return 0;
        case "under_review":
        case "validated":
        case "assigned":
            return 1;
        case "in_progress":
            return 2;
        case "work_completed":
        case "verification_pending":
        case "under_verification":
        case "quality_check":
        case "rework_required":
        case "reopened":
            return 3;
        case "resolved":
        case "verified_completed":
            return 4;
        case "closed":
            return 5;
        default:
            return 0;
    }
}

export function ComplaintStepper({ currentStatus, className, reworkReason }: StepperProps) {
    const currentIndex = getStatusStepIndex(currentStatus);
    const normalized = (currentStatus || "").toLowerCase();
    const isRework = normalized === "rework_required";
    const isReopened = normalized === "reopened";

    return (
        <div className={cn("space-y-0", className)}>
            {CITIZEN_LIFECYCLE_STEPS.map((step, idx) => {
                const isDone = currentIndex > idx;
                const isActive = currentIndex === idx;
                const isPending = currentIndex < idx;
                const isLast = idx === CITIZEN_LIFECYCLE_STEPS.length - 1;

                return (
                    <div key={step.key} className="flex items-start gap-3">
                        {/* Icon + Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                    isDone && "bg-emerald-600 text-white shadow-sm",
                                    isActive && !isRework && "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md shadow-emerald-600/20",
                                    isActive && isRework && "bg-amber-600 text-white ring-4 ring-amber-100 shadow-md shadow-amber-600/20",
                                    isPending && "bg-gray-100 text-gray-300"
                                )}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : isActive && isRework ? (
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                ) : isActive && isReopened ? (
                                    <RotateCcw className="w-4 h-4 text-white" />
                                ) : isActive ? (
                                    <Clock className="w-4 h-4 text-white" />
                                ) : (
                                    <Circle className="w-4 h-4 text-gray-300" />
                                )}
                            </div>
                            {!isLast && (
                                <div className={cn("w-0.5 h-10 mt-1", isDone ? "bg-emerald-500" : "bg-gray-200")} />
                            )}
                        </div>

                        {/* Content */}
                        <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                            <div className="flex items-center gap-2">
                                <p
                                    className={cn(
                                        "text-sm font-bold",
                                        isDone && "text-emerald-700",
                                        isActive && !isRework && "text-emerald-700",
                                        isActive && isRework && "text-amber-700",
                                        isPending && "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {isActive && isRework && (
                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                        Rework Required
                                    </span>
                                )}
                                {isActive && isReopened && (
                                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                                        Reopened
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>

                            {/* Active Rework Banner at Quality Verification step */}
                            {isActive && isRework && step.key === "quality_verification" && (
                                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2 shadow-sm">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-amber-950">
                                            Quality Check Failed — Rectification Underway
                                        </p>
                                        <p className="text-amber-800 mt-0.5">
                                            {reworkReason
                                                ? `Inspector notes: "${reworkReason}"`
                                                : "Work submitted by the field officer was inspected and did not meet municipal quality standards. It was sent back for mandatory 24-hour rework."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Active Reopen Banner */}
                            {isActive && isReopened && step.key === "quality_verification" && (
                                <div className="mt-2.5 p-3 bg-purple-50 border border-purple-300 rounded-lg text-xs text-purple-900 flex items-start gap-2 shadow-sm">
                                    <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-purple-950">
                                            Issue Reopened by Citizen
                                        </p>
                                        <p className="text-purple-800 mt-0.5">
                                            A contest was filed with photographic proof. The complaint has been escalated to supervisory review.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
