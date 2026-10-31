"use client";

import { SUNLIGHT_OPTIONS, WATERING_OPTIONS, SEASON_OPTIONS } from "@/constants/filters";
import type { FlowerFilters } from "@/types/filters";

interface Props {
    filters: FlowerFilters;
    onChange: (filters: FlowerFilters) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
    const set = (key: keyof FlowerFilters, value: string) =>
        onChange({ ...filters, [key]: value });

    return (
        <aside className="flex flex-col gap-4 p-4 rounded-2xl border"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>

        <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Filtros
        </h2>

        {/* Busca */}
        <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Buscar</label>
            <input
            type="text"
            placeholder="Nome da flor..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-[var(--color-flora-green-600)]"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
        </div>

        {/* Luz solar */}
        <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Luz solar</label>
            <select value={filters.sunlight} onChange={(e) => set("sunlight", e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">Todas</option>
            {SUNLIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            </select>
        </div>

        {/* Rega */}
        <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Rega</label>
            <select value={filters.watering} onChange={(e) => set("watering", e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">Todas</option>
            {WATERING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            </select>
        </div>

        {/* Estação */}
        <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Estação</label>
            <select value={filters.season} onChange={(e) => set("season", e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
            style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">Todas</option>
            {SEASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            </select>
        </div>

        {/* Limpar */}
        <button onClick={() => onChange({ search: "", sunlight: "", watering: "", season: "" })}
            className="text-xs py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Limpar filtros
        </button>
        </aside>
    );
}