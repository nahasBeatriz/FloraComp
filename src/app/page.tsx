"use client";

import { useState, useEffect, useCallback } from "react";
import FlowerCard from "@/components/flower/FlowerCard";
import FilterPanel from "@/components/flower/FilterPanel";
import type { Flower } from "@/types/flower";
import type { FlowerFilters } from "@/types/filters";
import { DEFAULT_FILTERS } from "@/types/filters";

export default function CatalogPage() {
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [filters, setFilters] = useState<FlowerFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    const fetchFlowers = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page) });
        if (filters.search)   params.set("search", filters.search);
        if (filters.sunlight) params.set("sunlight", filters.sunlight);
        if (filters.watering) params.set("watering", filters.watering);
        if (filters.season)   params.set("season", filters.season);

        try {
        const res = await fetch(`/api/flowers?${params}`);
        const json = await res.json();
        setFlowers(json.data ?? []);
        setLastPage(json.lastPage ?? 1);
        } finally {
        setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => { fetchFlowers(); }, [fetchFlowers]);

    // Reset para página 1 ao mudar filtros
    const handleFilterChange = (f: FlowerFilters) => {
        setFilters(f);
        setPage(1);
    };

    const toggleFavorite = (id: number) => {
        setFavorites((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
        });
    };

    return (
        <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Catálogo de Flores
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Explore espécies e filtre por luz, rega e estação
        </p>

        <div className="flex flex-col md:flex-row gap-6">
            {/* Filtros */}
            <div className="w-full md:w-56 shrink-0">
            <FilterPanel filters={filters} onChange={handleFilterChange} />
            </div>

            {/* Grid */}
            <div className="flex-1">
            {loading ? (
                <div className="flex justify-center items-center h-48">
                <span className="text-2xl animate-spin">🌸</span>
                </div>
            ) : flowers.length === 0 ? (
                <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
                Nenhuma flor encontrada com esses filtros.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flowers.map((flower) => (
                    <FlowerCard key={flower.id} flower={flower}
                    isFavorite={favorites.has(flower.perenualId ?? flower.id)}
                    onToggleFavorite={toggleFavorite} />
                ))}
                </div>
            )}

            {/* Paginação */}
            {!loading && lastPage > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-lg text-sm disabled:opacity-40"
                    style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                    ← Anterior
                </button>
                <span className="px-4 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {page} / {lastPage}
                </span>
                <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}
                    className="px-4 py-2 rounded-lg text-sm disabled:opacity-40"
                    style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                    Próxima →
                </button>
                </div>
            )}
            </div>
        </div>
        </main>
    );
}