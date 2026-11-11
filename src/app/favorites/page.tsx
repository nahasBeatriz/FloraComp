"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Flower } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";

export default function FavoritesPage() {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/favorites")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setFlowers(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function removeFavorite(id: number) {
        setFlowers((prev) => prev.filter((f) => (f.perenualId ?? f.id) !== id));
        fetch("/api/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ perenualId: id }),
        }).catch(() => {});
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
            <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            Favoritos
            </h1>
            {flowers.length > 0 && (
            <Link
                href="/arrangement"
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                Montar arranjo
            </Link>
            )}
        </div>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Flores que você marcou como favoritas
        </p>

        {loading ? (
            <div className="flex justify-center items-center h-48">
            <span className="text-3xl animate-spin">⚘</span>
            </div>
        ) : flowers.length === 0 ? (
            <div
            className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
            <span className="text-5xl">❤</span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Nenhuma flor favoritada ainda.
            </p>
            <Link
                href="/catalog"
                className="px-6 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                Explorar catálogo
            </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flowers.map((flower) => {
                const fid = flower.perenualId ?? flower.id;
                return (
                <div
                    key={fid}
                    className="rounded-2xl border overflow-hidden flex flex-col"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                    <div
                    className="relative h-44 w-full"
                    style={{ background: "var(--bg-surface)" }}>
                    {flower.imageUrl ? (
                        <Image
                        src={flower.imageUrl}
                        alt={flower.commonName ?? flower.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 25vw"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-4xl">⚘</div>
                    )}
                    <button
                        onClick={() => removeFavorite(fid)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-base shadow"
                        style={{ background: "var(--bg-card)" }}
                        aria-label="Remover dos favoritos">
                        ⁠♡
                    </button>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3
                        className="font-semibold text-sm leading-tight"
                        style={{ color: "var(--text-primary)" }}>
                        {flower.commonName ?? flower.name}
                    </h3>
                    <p
                        className="text-xs italic"
                        style={{ color: "var(--text-secondary)" }}>
                        {flower.name}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-1">
                        <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        ⛭ {SUNLIGHT_LABELS[flower.sunlight]}
                        </span>
                        <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        ꧞ {WATERING_LABELS[flower.watering]}
                        </span>
                        <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        𖠰 {SEASON_LABELS[flower.season]}
                        </span>
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                        <Link
                        href={`/flower/${fid}`}
                        className="flex-1 text-xs font-medium text-center py-2 rounded-lg"
                        style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                        Ver detalhes →
                        </Link>
                        <Link
                        href={`/arrangement?add=${fid}`}
                        className="flex-1 text-xs font-medium text-center py-2 rounded-lg text-white"
                        style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                        Arranjo
                        </Link>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        )}
        </main>
    );
}