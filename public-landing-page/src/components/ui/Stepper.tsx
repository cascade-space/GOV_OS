"use client";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { COMPLAINT_LIFECYCLE_STEPS, ComplaintStatus } from "@/lib/constants";

interface StepperProps {
    currentStatus: ComplaintStatus;
    className?: string;
}

const STATUS_ORDER: ComplaintStatus[] = [
    "submitted",
    "validated",
    "assigned",
    "in_progress",
    "quality_check",
    "resolved",
];

export function ComplaintStepper({ currentStatus, className }: StepperProps) {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus as any);

    return (
        <div className={cn("space-y-0", className)}>
            {COMPLAINT_LIFECYCLE_STEPS.map((step, idx) => {
                const isDone = currentIndex > idx;
                const isActive = currentIndex === idx;
                const isPending = currentIndex < idx;
                const isLast = idx === COMPLAINT_LIFECYCLE_STEPS.length - 1;

                return (
                    <div key={step.key} className="flex items-start gap-3">
                        {/* Icon + Line */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                    isDone && "bg-emerald-600 text-white shadow-sm",
                                    isActive && "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md shadow-emerald-600/20",
                                    isPending && "bg-gray-100 text-gray-300"
                                )}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : isActive ? (
                                    <Clock className="w-4 h-4 text-white" />
                                ) : (
                                    <Circle className="w-4 h-4 text-gray-300" />
                                )}
                            </div>
                            {!isLast && (
                                <div className={cn("w-0.5 h-8 mt-1", isDone ? "bg-emerald-500" : "bg-gray-200")} />
                            )}
                        </div>
                        {/* Content */}
                        <div className={cn("pb-6", isLast && "pb-0")}>
                            <p
                                className={cn(
                                    "text-sm font-bold",
                                    isDone && "text-emerald-700",
                                    isActive && "text-emerald-700",
                                    isPending && "text-gray-400"
                                )}
                            >
                                {step.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
