"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
    { href: "/catalog", label: "Catálogo" },
    { href: "/arrangement", label: "Montar Arranjo" },
    { href: "/gallery", label: "Galeria" },
    { href: "/favorites", label: "Favoritos" },
];

export default function Header() {
    const pathname = usePathname();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme") as "light" | "dark" | null;
        const initial = saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(initial);
        document.documentElement.setAttribute("data-theme", initial);
    }, []);

    function toggleTheme() {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    }

    return (
        <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            <span className="text-2xl">🌿</span>
            <span>FloraComp</span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    style={{
                    backgroundColor: active ? "var(--color-flora-green-700)" : "transparent",
                    color: active ? "#fff" : "var(--text-secondary)",
                    }}
                >
                    {link.label}
                </Link>
                );
            })}
            </nav>

            {/* Ações */}
            <div className="flex items-center gap-2">
            <button
                onClick={toggleTheme}
                aria-label="Alternar tema"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
                {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Hamburger mobile */}
            <button
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
            >
                {menuOpen ? "✕" : "☰"}
            </button>
            </div>
        </div>

        {/* Nav mobile */}
        {menuOpen && (
            <div className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
            {NAV_LINKS.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
                >
                {link.label}
                </Link>
            ))}
            </div>
        )}
        </header>
    );
}