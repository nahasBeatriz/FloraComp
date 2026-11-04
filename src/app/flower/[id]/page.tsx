"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Flower } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";

const CARE_ICONS: Record<string, string> = {
    full_sun: "𖤓",
    part_shade: "𖤓☁",
    full_shade: "☁",
    frequent: "꧞꧞꧞",
    average: "꧞꧞",
    minimum: "꧞",
    spring: "𖡼.𖤣𖥧𖡼.𖤣𖥧",
    summer: "𖤓 ｡𖦹°‧ ⋆☀︎.",
    fall: "𖡼𖤣𖥧𖡼𓋼𖤣𖥧𓋼𓍊",
    winter: "⋆꙳•❅‧*₊⋆☃︎‧*❆₊⋆",
};

export default function FlowerDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [flower, setFlower] = useState<Flower | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        async function load() {
        try {
            const res = await fetch(`/api/flowers/${id}`);
            if (!res.ok) throw new Error();
            const data: Flower = await res.json();
            setFlower(data);

            try {
                const saved = localStorage.getItem("floracomp_favorites");
                if (saved) {
                    const ids: number[] = JSON.parse(saved);
                    setIsFavorite(ids.includes(data.perenualId ?? data.id));
                }
            } catch {}
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
        }
        load();
    }, [id]);

    const toggleFavorite = () => {
        if (!flower) return;
        const fid = flower.perenualId ?? flower.id;
        try {
        const saved = localStorage.getItem("floracomp_favorites");
        const ids: number[] = saved ? JSON.parse(saved) : [];
        const next = isFavorite ? ids.filter((x) => x !== fid) : [...ids, fid];
        localStorage.setItem("floracomp_favorites", JSON.stringify(next));
        setIsFavorite(!isFavorite);
        } catch {}
    };

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-96">
            <span className="text-4xl animate-spin">಄</span>
        </div>
        );
    }

    if (error || !flower) {
        return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-5xl mb-4">𓇢𓆸</p>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
            Flor não encontrada.
            </p>
            <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-full text-sm font-medium"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Voltar
            </button>
        </div>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <Link href="/catalog" className="hover:underline">Catálogo</Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>
            {flower.commonName ?? flower.name}
            </span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
            <div
            className="relative w-full md:w-80 h-72 md:h-80 rounded-2xl overflow-hidden shrink-0"
            style={{ background: "var(--bg-surface)" }}>
            {flower.imageUrl ? (
                <Image
                src={flower.imageUrl}
                alt={flower.commonName ?? flower.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"/>
            ) : (
                <div className="flex items-center justify-center h-full text-6xl">⚘</div>
            )}
            </div>

            <div className="flex flex-col gap-5 flex-1">
            <div>
                <h1
                className="text-3xl font-bold leading-tight"
                style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
                {flower.commonName ?? flower.name}
                </h1>
                <p className="text-sm italic mt-1" style={{ color: "var(--text-secondary)" }}>
                {flower.name}
                </p>
            </div>

            <div
                className="rounded-2xl border p-4 grid grid-cols-3 gap-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{CARE_ICONS[flower.sunlight]}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {SUNLIGHT_LABELS[flower.sunlight]}
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Luz</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{CARE_ICONS[flower.watering]}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {WATERING_LABELS[flower.watering]}
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Rega</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{CARE_ICONS[flower.season]}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {SEASON_LABELS[flower.season]}
                </span>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Floração</span>
                </div>
            </div>

            {flower.description && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {flower.description}
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                onClick={toggleFavorite}
                className="flex-1 py-3 rounded-full text-sm font-semibold border transition-colors"
                style={{
                    background: isFavorite ? "var(--color-flora-rose-100)" : "var(--bg-surface)",
                    borderColor: isFavorite ? "var(--color-flora-rose-400)" : "var(--border-color)",
                    color: isFavorite ? "var(--color-flora-rose-500)" : "var(--text-secondary)",
                }}
                >
                {isFavorite ? "❤︎ Favoritada" : "♡ Favoritar"}
                </button>
                <Link
                href={`/arrangement?add=${flower.perenualId ?? flower.id}`}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-center text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                Adicionar ao arranjo
                </Link>
            </div>
            </div>
        </div>
        </main>
    );
}