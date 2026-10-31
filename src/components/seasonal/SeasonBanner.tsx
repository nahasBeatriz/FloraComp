"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SeasonInfo = { name: string; icon: string; tip: string; value: string };

const SEASONS: SeasonInfo[] = [
    { name: "Verão", icon: "", tip: "Orquídeas e hibiscos estão em plena floração.", value: "summer" },
    { name: "Verão", icon: "", tip: "Orquídeas e hibiscos estão em plena floração.", value: "summer" },
    { name: "Outono", icon: "", tip: "Crisântemos e dálias são as estrelas desta estação.", value: "fall" },
    { name: "Outono", icon: "", tip: "Crisântemos e dálias são as estrelas desta estação.", value: "fall" },
    { name: "Outono", icon: "", tip: "Crisântemos e dálias são as estrelas desta estação.", value: "fall" },
    { name: "Inverno", icon: "", tip: "Camélias e violetas africanas resistem bem ao frio.", value: "winter" },
    { name: "Inverno", icon: "", tip: "Camélias e violetas africanas resistem bem ao frio.", value: "winter" },
    { name: "Inverno", icon: "", tip: "Camélias e violetas africanas resistem bem ao frio.", value: "winter" },
    { name: "Primavera", icon: "", tip: "Ótima época para plantar rosas, lavandas e girassóis.", value: "spring" },
    { name: "Primavera", icon: "", tip: "Ótima época para plantar rosas, lavandas e girassóis.", value: "spring" },
    { name: "Primavera", icon: "", tip: "Ótima época para plantar rosas, lavandas e girassóis.", value: "spring" },
    { name: "Verão", icon: "", tip: "Orquídeas e hibiscos estão em plena floração.", value: "summer" },
]; // índice = mês-1 (0=jan ... 11=dez)

export default function SeasonBanner() {
    const [season, setSeason] = useState<SeasonInfo | null>(null);

    useEffect(() => {
        const month = new Date().getMonth(); // 0-11
        setSeason(SEASONS[month]);
    }, []);

    if (!season) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div
            className="rounded-2xl px-6 py-4 flex items-center gap-4 shadow-lg"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", border: "1px solid" }}>
            <span className="text-3xl">{season.icon}</span>
            <div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>
                {season.name} no hemisfério sul
            </p>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                💡 {season.tip}
            </p>
            </div>
            <Link
            href={`/catalog?season=${season.value}`}
            className="ml-auto text-sm font-medium shrink-0"
            style={{ color: "var(--color-flora-green-600)" }}>
            Ver flores da estação 
            </Link>
        </div>
        </section>
    );
}