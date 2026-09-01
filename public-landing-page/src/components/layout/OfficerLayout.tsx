"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OFFICER_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CheckSquare, Clock, MapPin, LogOut, User } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
    CheckSquare: <CheckSquare className="w-4 h-4" />,
    Clock: <Clock className="w-4 h-4" />,
    User: <User className="w-4 h-4" />,
};

export function OfficerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <header className="bg-civic-blue text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-none">CivicPath</p>
                        <p className="text-blue-200 text-xs">Field Officer</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">O</span>
                        </div>
                        <span className="text-white text-sm font-medium hidden sm:block">Officer</span>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-5 animate-fade-in pb-24">
                {children}
            </main>

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-card-xl z-40">
                <div className="max-w-2xl mx-auto flex">
                    {OFFICER_NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
                                pathname === item.href || pathname.startsWith(item.href + "/")
                                    ? "text-civic-blue"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {ICONS[item.icon]}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <Link
                        href="/admin/login"
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
