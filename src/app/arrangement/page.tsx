"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Flower, Season } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";

interface PlacedFlower {
    flower: Flower;
    key: number;
}

function compatibilityCheck(flowers: Flower[]): { ok: boolean; message: string } {
    if (flowers.length < 2) return { ok: true, message: "Adicione pelo menos 2 flores para ver a compatibilidade." };

    const waterings = new Set(flowers.map((f) => f.watering));
    if (waterings.has("frequent") && waterings.has("minimum")) {
        return { ok: false, message: "Conflito de rega: você misturou flores de rega frequente com rega mínima." };
    }

    const sunlights = new Set(flowers.map((f) => f.sunlight));
    if (sunlights.has("full_sun") && sunlights.has("full_shade")) {
        return { ok: false, message: "Conflito de luz: sol pleno e sombra total não combinam bem." };
    }

    return { ok: true, message: "Boa combinação! Essas flores têm necessidades compatíveis." };
}

function dominantCare(flowers: Flower[]) {
    if (flowers.length === 0) return null;
    const count = <T extends string>(arr: T[]): T | null => {
        if (arr.length === 0) return null;
        const freq: Record<string, number> = {};
        arr.forEach((v) => { freq[v] = (freq[v] ?? 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as T;
    };
    return {
        sunlight: count(flowers.map((f) => f.sunlight))!,
        watering: count(flowers.map((f) => f.watering))!,
        season: count(flowers.map((f) => f.season).filter((s): s is Season => s !== null)),
    };
}

function ArrangementContent() {
    const searchParams = useSearchParams();
    const preAddId = searchParams.get("add");
    const [catalog, setCatalog] = useState<Flower[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [placed, setPlaced] = useState<PlacedFlower[]>([]);
    const counterRef = useRef(0);
    const [arrangementName, setArrangementName] = useState("Meu Arranjo");
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState("");

    const fetchCatalog = useCallback(async (q = "") => {
        setLoadingCatalog(true);
        try {
            const params = new URLSearchParams({ page: "1" });
            if (q) params.set("search", q);
            const res = await fetch(`/api/flowers?${params}`);
            const json = await res.json();
            setCatalog(json.data ?? []);
        } finally {
            setLoadingCatalog(false);
        }
    }, []);

    useEffect(() => { fetchCatalog(); }, [fetchCatalog]);
    useEffect(() => {
        if (!preAddId || catalog.length === 0) return;
        const flower = catalog.find(
        (f) => String(f.perenualId ?? f.id) === preAddId
        );
        if (flower) addFlower(flower);
    }, [preAddId, catalog]);

    useEffect(() => {
        const timer = setTimeout(() => fetchCatalog(search), 400);
        return () => clearTimeout(timer);
    }, [search, fetchCatalog]);

    function addFlower(flower: Flower) {
        const key = counterRef.current++;
        setPlaced((prev) => [...prev, { flower, key }]);
        setSaved(false);
    }

    function removeFlower(key: number) {
        setPlaced((prev) => prev.filter((p) => p.key !== key));
        setSaved(false);
    }

    // Salva o arranjo no banco via API
    async function saveArrangement() {
        if (placed.length === 0) return;
        try {
            const res = await fetch("/api/arrangements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: arrangementName,
                    flowers: placed.map((p) => ({
                        flower: p.flower,
                        positionX: 0,
                        positionY: 0,
                    })),
                }),
            });
            if (res.ok) setSaved(true);
        } catch {
            console.error("Erro ao salvar arranjo");
        }
    }

    const compat = compatibilityCheck(placed.map((p) => p.flower));
    const care = dominantCare(placed.map((p) => p.flower));

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
        <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            Montar Arranjo
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Escolha flores do catálogo e monte sua composição
        </p>

        <div className="flex flex-col lg:flex-row gap-6">
            <div
            className="w-full lg:w-72 shrink-0 rounded-2xl border p-4 flex flex-col gap-3"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Flores disponíveis
            </h2>
            <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
                style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
                }}/>

            {loadingCatalog ? (
                <div className="flex justify-center py-6">
                <span className="text-2xl animate-spin">꩜</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
                {catalog.map((flower) => (
                    <button
                    key={flower.perenualId ?? flower.id}
                    onClick={() => addFlower(flower)}
                    className="flex items-center gap-3 p-2 rounded-xl text-left transition-colors hover:opacity-80"
                    style={{ background: "var(--bg-surface)" }}>
                    <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                        style={{ background: "var(--border-color)" }}>
                        {flower.imageUrl ? (
                        <Image
                            src={flower.imageUrl}
                            alt={flower.commonName ?? flower.name}
                            fill
                            className="object-cover"
                            sizes="40px"/>
                        ) : (
                        <div className="flex items-center justify-center h-full text-lg">꩜</div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span
                        className="text-xs font-medium truncate"
                        style={{ color: "var(--text-primary)" }}>
                        {flower.commonName ?? flower.name}
                        </span>
                        <span
                        className="text-xs truncate italic"
                        style={{ color: "var(--text-secondary)" }}>
                        {flower.name}
                        </span>
                    </div>
                    <span className="ml-auto text-lg shrink-0">＋</span>
                    </button>
                ))}
                </div>
            )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                type="text"
                value={arrangementName}
                onChange={(e) => setArrangementName(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold border outline-none"
                style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                }}/>
                <div className="flex gap-2">
                <button
                    onClick={() => { setPlaced([]); setSaved(false); }}
                    className="px-4 py-2 rounded-xl text-sm border"
                    style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                    }}>
                    Limpar
                </button>
                <button
                    onClick={saveArrangement}
                    disabled={placed.length === 0}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                    {saved ? "Salvo!" : "Salvar"}
                </button>
                </div>
            </div>

            <div
                className="rounded-2xl border min-h-64 p-4 flex flex-wrap gap-3 content-start"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                {placed.length === 0 ? (
                <div
                    className="w-full flex flex-col items-center justify-center h-48 gap-2"
                    style={{ color: "var(--text-secondary)" }}>
                    <span className="text-4xl">☘</span>
                    <p className="text-sm">Clique nas flores ao lado para adicioná-las aqui</p>
                </div>
                ) : (
                placed.map(({ flower, key }) => (
                    <div
                    key={key}
                    className="flex flex-col items-center gap-1 group relative"
                    >
                    <div
                        className="relative w-20 h-20 rounded-xl overflow-hidden border"
                        style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-color)",
                        }}>
                        {flower.imageUrl ? (
                        <Image
                            src={flower.imageUrl}
                            alt={flower.commonName ?? flower.name}
                            fill
                            className="object-cover"
                            sizes="80px"/>
                        ) : (
                        <div className="flex items-center justify-center h-full text-3xl">⚘</div>
                        )}
                        <button
                        onClick={() => removeFlower(key)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                        ✕
                        </button>
                    </div>
                    <span
                        className="text-xs text-center max-w-20 leading-tight"
                        style={{ color: "var(--text-secondary)" }}>
                        {flower.commonName ?? flower.name}
                    </span>
                    </div>
                ))
                )}
            </div>

            {placed.length > 0 && (
                <div
                className="rounded-2xl border p-4 flex items-start gap-3"
                style={{
                    background: compat.ok ? "var(--bg-card)" : "var(--color-flora-rose-100)",
                    borderColor: compat.ok ? "var(--border-color)" : "var(--color-flora-rose-400)",
                }}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {compat.message}
                </p>
                </div>
            )}

            {care && (
                <div
                className="rounded-2xl border p-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}>
                    Resumo de cuidados do arranjo
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Luz predominante</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {SUNLIGHT_LABELS[care.sunlight]}
                    </p>
                    </div>
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Rega predominante</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {WATERING_LABELS[care.watering]}
                    </p>
                    </div>
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Estação principal</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {care.season ? SEASON_LABELS[care.season] : "—"}
                    </p>
                    </div>
                </div>
                </div>
            )}

            {saved && (
                <Link
                href="/gallery"
                className="text-sm text-center font-medium underline"
                style={{ color: "var(--color-flora-green-600)" }}>
                Ver na galeria
                </Link>
            )}
            </div>
        </div>
        </main>
    );
}

export default function ArrangementPage() {
    return (
        <Suspense fallback={
        <div className="flex justify-center items-center min-h-96">
            <span className="text-4xl animate-spin">಄</span>
        </div>
        }>
        <ArrangementContent />
        </Suspense>
    );
}