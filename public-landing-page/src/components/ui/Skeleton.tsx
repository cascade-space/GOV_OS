"use client";

// Skeleton loaders for various content types
export function SkeletonLine({ className = "" }: { className?: string }) {
    return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="civic-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <SkeletonLine className="w-24" />
                <div className="skeleton w-8 h-8 rounded-lg" />
            </div>
            <SkeletonLine className="w-16 h-8" />
            <SkeletonLine className="w-32" />
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <tr>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <td key={i} className="px-4 py-3">
                    <SkeletonLine className={i === 1 ? "w-24" : i === 3 ? "w-40" : "w-20"} />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonComplaintCard() {
    return (
        <div className="civic-card p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <SkeletonLine className="w-32" />
                    <SkeletonLine className="w-full" />
                    <SkeletonLine className="w-3/4" />
                </div>
                <div className="skeleton w-16 h-6 rounded-full ml-3" />
            </div>
            <div className="flex items-center gap-2">
                <div className="skeleton w-20 h-5 rounded-full" />
                <div className="skeleton w-24 h-5 rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="civic-card p-5 h-64" />
                <div className="civic-card p-5 h-64" />
            </div>
        </div>
    );
}
