"use client";

import Image from "next/image";
import Link from "next/link";
import type { Flower } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";

interface Props {
    flower: Flower;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
}

export default function FlowerCard({ flower, isFavorite = false, onToggleFavorite }: Props) {
    return (
        <div className="rounded-2xl overflow-hidden border flex flex-col"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>

        {/* Imagem */}
        <div className="relative h-48 w-full bg-[var(--bg-surface)]">
            {flower.imageUrl ? (
            <Image src={flower.imageUrl} alt={flower.commonName ?? flower.name}
                fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            ) : (
            <div className="flex items-center justify-center h-full text-4xl">🌸</div>
            )}

            {/* Botão favorito */}
            {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(flower.perenualId ?? flower.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow"
                style={{ background: "var(--bg-card)" }}
                aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                {isFavorite ? "❤️" : "🤍"}
            </button>
            )}
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex flex-col gap-2 flex-1">
            <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
            {flower.commonName ?? flower.name}
            </h3>
            <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
            {flower.name}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                style={{ color: "var(--text-secondary)" }}>
                ☀️ {SUNLIGHT_LABELS[flower.sunlight]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                style={{ color: "var(--text-secondary)" }}>
                💧 {WATERING_LABELS[flower.watering]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                style={{ color: "var(--text-secondary)" }}>
                🌿 {SEASON_LABELS[flower.season]}
            </span>
            </div>

            {/* Link detalhes */}
            <Link href={`/flower/${flower.perenualId ?? flower.id}`}
            className="mt-auto pt-3 text-xs font-medium text-center rounded-lg py-2 transition-colors"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Ver detalhes →
            </Link>
        </div>
        </div>
    );
}