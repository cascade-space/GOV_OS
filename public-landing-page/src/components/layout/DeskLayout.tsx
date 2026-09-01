"use client";

import { ReactNode } from "react";

interface DeskLayoutProps {
    children: ReactNode;
}

export function DeskLayout({ children }: DeskLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}
