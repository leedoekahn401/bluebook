"use client";

import Image from "next/image";
import logo from "@/assets/sat-png-4.png";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Settings, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // Don't show navbar if loading, unauthenticated, or on specific routes (like the test view or login)
    if (
        status === "loading" ||
        status === "unauthenticated" ||
        !session ||
        pathname.startsWith("/test/") ||
        pathname === "/auth"
    ) {
        return null;
    }

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src={logo} alt="SATTOT Logo" width={32} height={32} className="rounded object-contain" />
                            <span className="font-bold text-xl text-slate-900 hover:text-blue-600">
                                SATTOT
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {session.user.role === "admin" && (
                            <Link
                                href="/admin"
                                className={`flex items-center gap-1 text-sm font-medium hover:text-blue-600 ${pathname === "/admin" ? "text-blue-600" : "text-slate-600"}`}
                            >
                                <Settings className="w-4 h-4" />
                                Admin
                            </Link>
                        )}

                        <Link
                            href="/review"
                            className={`flex items-center gap-1 text-sm font-medium hover:text-blue-600 ${pathname === "/review" ? "text-blue-600" : "text-slate-600"}`}
                        >
                            <BarChart2 className="w-4 h-4" />
                            Review Mistakes
                        </Link>

                        <Link
                            href="/settings"
                            className={`flex items-center gap-1 text-sm font-medium hover:text-blue-600 ${pathname === "/settings" ? "text-blue-600" : "text-slate-600"}`}
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>

                        <div className="h-6 w-px bg-slate-200 mx-2" />

                        <span className="text-sm font-medium text-slate-700 hidden sm:block">
                            Hi, {session.user.name || session.user.email?.split('@')[0]}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                            title="Log out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
