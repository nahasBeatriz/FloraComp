"use client";

import Image from "next/image";
import Link from "next/link";
import type { Flower } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";

type CareInfo = Pick<Flower, "sunlight" | "watering" | "season">;

interface Props {
    flower: Flower;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
    // Quando true, a flor veio sem rega/luz/estação confirmadas (listagem
    // rápida, sem bater no Plant Details) e o card espera o pai buscar isso
    // em lote pra todos os cards visíveis (ver catalog/page.tsx) e repassar
    // pela prop careInfo quando chegar.
    loadCareInfo?: boolean;
    careInfo?: CareInfo;
}

export default function FlowerCard({ flower, isFavorite = false, onToggleFavorite, loadCareInfo = false, careInfo }: Props) {
    const careReady = !loadCareInfo || careInfo !== undefined;
    const sunlight = careInfo?.sunlight ?? flower.sunlight;
    const watering = careInfo?.watering ?? flower.watering;
    const season = careInfo?.season ?? flower.season;

    return (
        <div className="rounded-2xl overflow-hidden border flex flex-col"
        style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>

        {/* Imagem */}
        <div className="relative h-48 w-full bg-[var(--bg-surface)]">
            {flower.imageUrl ? (
            <Image src={flower.imageUrl} alt={flower.commonName ?? flower.name}
                fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            ) : (
            <div className="flex items-center justify-center h-full text-4xl">⚘</div>
            )}

            {/* Botão favorito */}
            {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(flower.perenualId ?? flower.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow"
                style={{ background: "var(--bg-card)" }}
                aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                {isFavorite ? "❤︎" : "♡"}
            </button>
            )}
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
            <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
            {flower.commonName ?? flower.name}
            </h3>
            <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
            {flower.name}
            </p>

            <div className="flex flex-wrap gap-1 mt-1">
            {careReady ? (
                <>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                    style={{ color: "var(--text-secondary)" }}>
                    ☀︎ {SUNLIGHT_LABELS[sunlight]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                    style={{ color: "var(--text-secondary)" }}>
                    ꧞ {WATERING_LABELS[watering]}
                </span>
                {season && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]"
                    style={{ color: "var(--text-secondary)" }}>
                    𖠰 {SEASON_LABELS[season]}
                </span>
                )}
                </>
            ) : (
                <>
                <span className="w-16 h-5 rounded-full bg-[var(--bg-surface)] animate-pulse" />
                <span className="w-20 h-5 rounded-full bg-[var(--bg-surface)] animate-pulse" />
                </>
            )}
            </div>

            <Link href={`/flower/${flower.perenualId ?? flower.id}`}
            className="mt-auto pt-3 text-xs font-medium text-center rounded-lg py-2 transition-colors"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            Ver detalhes →
            </Link>
        </div>
        </div>
    );
}