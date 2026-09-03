"use client";
import React, { useState } from "react";
import { PublicNavbar } from "./PublicNavbar";
import { PublicFooter } from "./PublicFooter";
import { CitizenLoginModal } from "./CitizenLoginModal";

export function CitizenLayout({ children }: { children: React.ReactNode }) {
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <PublicNavbar />
            <main className="flex-1 animate-fade-in">{children}</main>
            <PublicFooter />
            <CitizenLoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
}
