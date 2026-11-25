"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FlowerCard from "@/components/flower/FlowerCard";
import FilterPanel from "@/components/flower/FilterPanel";
import type { Flower } from "@/types/flower";
import type { FlowerFilters } from "@/types/filters";
import { DEFAULT_FILTERS } from "@/types/filters";
import type { Season, Sunlight, Watering } from "@/types/flower";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

type CareInfo = Pick<Flower, "sunlight" | "watering" | "season">;

function CatalogContent() {
    const searchParams = useSearchParams();
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [filters, setFilters] = useState<FlowerFilters>({
        ...DEFAULT_FILTERS,
        season: (searchParams.get("season") as Season) || "",
        sunlight: (searchParams.get("sunlight") as Sunlight) || "",
        watering: (searchParams.get("watering") as Watering) || "",
        search: searchParams.get("search") || "",
    });
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [stale, setStale] = useState(false);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [care, setCare] = useState<Record<number, CareInfo>>({});
    const { toastMessage, showToast } = useToast();

    // Atraso antes de aplicar os filtros à busca, pra não disparar um fetch
    // (que agora inclui chamadas de detalhe) a cada tecla digitada.
    const [debouncedFilters, setDebouncedFilters] = useState<FlowerFilters>(filters);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedFilters((prev) =>
                JSON.stringify(prev) === JSON.stringify(filters) ? prev : filters
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [filters]);

    useEffect(() => {
        fetch("/api/favorites")
            .then((r) => r.json())
            .then((data: Flower[]) => {
                if (Array.isArray(data)) {
                    setFavorites(new Set(data.map((f) => f.perenualId ?? f.id)));
                }
            })
            .catch(() => {});
    }, []);

    const fetchFlowers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page) });
        if (debouncedFilters.search) params.set("search", debouncedFilters.search);
        if (debouncedFilters.sunlight) params.set("sunlight", debouncedFilters.sunlight);
        if (debouncedFilters.watering) params.set("watering", debouncedFilters.watering);
        if (debouncedFilters.season) params.set("season", debouncedFilters.season);

        try {
            const res = await fetch(`/api/flowers?${params}`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            setFlowers(json.data ?? []);
            setLastPage(json.lastPage ?? 1);
            setFetchError(false);
            setStale(!!json.stale);
        } catch {
            setFlowers([]);
            setFetchError(true);
            setStale(false);
        } finally {
            setLoading(false);
        }
    }, [debouncedFilters, page]);

    useEffect(() => { fetchFlowers(); }, [fetchFlowers]);

    // Busca luz/rega/estação de todos os cards visíveis em uma única chamada
    // (em vez de uma por card) — a listagem básica da Perenual não traz isso
    // confirmado (ver fetchFlowers em services/perenualApi.ts), e buscar card
    // por card multiplicava por até 10x o consumo da cota diária da API a
    // cada página vista.
    useEffect(() => {
        if (debouncedFilters.season || flowers.length === 0) return;
        let cancelled = false;
        const ids = flowers.map((f) => f.perenualId ?? f.id);

        fetch(`/api/flowers/care?ids=${ids.join(",")}`)
            .then((r) => (r.ok ? r.json() : {}))
            .then((data: Record<number, CareInfo>) => {
                if (!cancelled) setCare(data);
            })
            .catch(() => {});

        return () => { cancelled = true; };
    }, [flowers, debouncedFilters.season]);

    const handleFilterChange = (f: FlowerFilters) => {
        setFilters(f);
        setPage(1);
    };

    const toggleFavorite = (id: number) => {
        const isFav = favorites.has(id);
        setFavorites((prev) => {
            const next = new Set(prev);
            isFav ? next.delete(id) : next.add(id);
            return next;
        });
        fetch("/api/favorites", {
            method: isFav ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ perenualId: id }),
        }).catch(() => {
            setFavorites((prev) => {
                const next = new Set(prev);
                isFav ? next.add(id) : next.delete(id);
                return next;
            });
            showToast("Não foi possível atualizar o favorito.");
        });
    };

    return (
        <section className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
        <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            Catálogo de Flores
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Explore espécies e filtre por luz, rega e estação
        </p>

        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 shrink-0">
            <FilterPanel filters={filters} onChange={handleFilterChange} />
            </div>

            <div className="flex-1">
            {!loading && !fetchError && stale && (
                <div
                className="text-xs rounded-xl px-3 py-2 mb-3 border"
                style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--border-color)",
                    background: "var(--bg-card)",
                }}>
                ⓘ Mostrando uma versão salva deste catálogo — a API ao vivo está indisponível no momento
                (ex: limite diário de requisições).
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                <span className="text-3xl animate-spin">಄</span>
                </div>
            ) : fetchError ? (
                <div
                className="text-center py-16 rounded-2xl border"
                style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--color-flora-rose-400)",
                    background: "var(--bg-card)",
                }}>
                <p className="text-4xl mb-3">⚠</p>
                <p>Não foi possível carregar o catálogo agora.</p>
                <p className="text-xs mt-1">
                    A API de flores pode estar temporariamente indisponível (ex: limite diário de
                    requisições). Tente novamente em alguns instantes.
                </p>
                </div>
            ) : flowers.length === 0 ? (
                <div
                className="text-center py-16 rounded-2xl border"
                style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--border-color)",
                    background: "var(--bg-card)",
                }}>
                <p className="text-4xl mb-3">↟↟𓂃 ོ ☼𓂃↟ 𖠰𓂃 ོ𓂃</p>
                <p>Nenhuma flor encontrada com esses filtros.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flowers.map((flower) => {
                    const id = flower.perenualId ?? flower.id;
                    return (
                        <FlowerCard
                        key={flower.id}
                        flower={flower}
                        isFavorite={favorites.has(id)}
                        onToggleFavorite={toggleFavorite}
                        loadCareInfo={!debouncedFilters.season}
                        careInfo={care[id]}/>
                    );
                })}
                </div>
            )}

            {!loading && !fetchError && lastPage > 1 && (
                <div className="flex flex-col items-center gap-2 mt-8">
                <div className="flex justify-center items-center gap-3">
                    <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity"
                    style={{
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                    }}>
                    Anterior
                    </button>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {`${page} / ${lastPage}`}
                    </span>
                    <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity"
                    style={{
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                    }}>
                    Próxima
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
        <Toast message={toastMessage} />
        </section>
    );
}

export default function CatalogPage() {
    return (
        <Suspense>
            <CatalogContent />
        </Suspense>
    );
}