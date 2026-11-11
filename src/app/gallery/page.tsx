"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";
import type { Flower } from "@/types/flower";

interface SavedArrangement {
    id: number;
    name: string;
    createdAt: string;
    flowers: { flower: Flower; positionX: number; positionY: number }[];
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function ArrangementCard({
    arrangement,
    onDelete,
    }: {
    arrangement: SavedArrangement;
    onDelete: (id: number) => void;
    }) {
    const [expanded, setExpanded] = useState(false);
    const flowers = arrangement.flowers.map((f) => f.flower);
    const preview = flowers.slice(0, 5);
    const rest = flowers.length - preview.length;

    return (
        <div
        className="rounded-2xl border overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div
            className="flex h-36 overflow-hidden"
            style={{ background: "var(--bg-surface)" }}>
            {preview.length === 0 ? (
            <div className="flex items-center justify-center w-full text-4xl">⚘</div>
            ) : (
            preview.map((flower, i) => (
                <div
                key={i}
                className="relative flex-1 h-full"
                style={{ background: "var(--bg-surface)" }}>
                {flower.imageUrl ? (
                    <Image
                    src={flower.imageUrl}
                    alt={flower.commonName ?? flower.name}
                    fill
                    className="object-cover"
                    sizes="120px"/>
                ) : (
                    <div className="flex items-center justify-center h-full text-2xl">⚘</div>
                )}
                {i === preview.length - 1 && rest > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "rgba(0,0,0,0.45)" }}>
                    +{rest}
                    </div>
                )}
                </div>
            ))
            )}
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-start justify-between gap-2">
            <div>
                <h3
                className="font-semibold text-sm leading-tight"
                style={{ color: "var(--text-primary)" }}>
                {arrangement.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {formatDate(arrangement.createdAt)} · {flowers.length}{" "}
                {flowers.length === 1 ? "flor" : "flores"}
                </p>
            </div>
            <button
                onClick={() => onDelete(arrangement.id)}
                className="text-xs px-2 py-1 rounded-lg shrink-0 transition-opacity hover:opacity-70"
                style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                ♻
            </button>
            </div>

            <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-left"
            style={{ color: "var(--color-flora-green-600)" }}>
            {expanded ? "Ocultar flores" : "Ver flores"}
            </button>

            {expanded && (
            <ul className="flex flex-col gap-1">
                {flowers.map((flower, i) => (
                <li
                    key={i}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--text-secondary)" }}>
                    <span>⚘</span>
                    <span className="truncate">{flower.commonName ?? flower.name}</span>
                    <span className="ml-auto shrink-0">
                    {SUNLIGHT_LABELS[flower.sunlight].split(" ")[0]} ·{" "}
                    {WATERING_LABELS[flower.watering].split(" ")[0]} ·{" "}
                    {flower.season ? SEASON_LABELS[flower.season] : "—"}
                    </span>
                </li>
                ))}
            </ul>
            )}

            <Link
            href={`/arrangement`}
            className="mt-auto text-xs font-medium text-center py-2 rounded-lg transition-colors"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Novo arranjo
            </Link>
        </div>
        </div>
    );
}

export default function GalleryPage() {
    const [arrangements, setArrangements] = useState<SavedArrangement[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/arrangements")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setArrangements(data);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    function deleteArrangement(id: number) {
        setArrangements((prev) => prev.filter((a) => a.id !== id));
        fetch(`/api/arrangements/${id}`, { method: "DELETE" }).catch(() => {});
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
            <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            Galeria
            </h1>
            <Link
            href="/arrangement"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-flora-green-700)" }}>
            + Novo arranjo
            </Link>
        </div>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Seus arranjos salvos
        </p>

        {!loaded ? (
            <div className="flex justify-center items-center h-48">
            <span className="text-3xl animate-spin">಄</span>
            </div>
        ) : arrangements.length === 0 ? (
            <div
            className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border"
            style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}>
            <span className="text-5xl">𓊆  𓊇  𓊈  𓊉  𓉘  𓉝</span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Nenhum arranjo salvo ainda.
            </p>
            <Link
                href="/arrangement"
                className="px-6 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                Criar primeiro arranjo
            </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {arrangements.map((arr) => (
                <ArrangementCard
                key={arr.id}
                arrangement={arr}
                onDelete={deleteArrangement}/>
            ))}
            </div>
        )}
        </main>
    );
}