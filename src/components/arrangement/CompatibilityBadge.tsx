"use client";

import type { Flower } from "@/types/flower";
import type { CompatibilityResult } from "@/utils/compatibility";

interface Props {
    result: CompatibilityResult;
}

// bg/border não variam por tema (claro/escuro), então o texto também fica
// fixo em vez de usar var(--text-primary)/--text-secondary, que são
// otimizados para o fundo do tema e ficam ilegíveis aqui no escuro.
const LEVEL_STYLE: Record<CompatibilityResult["level"], { bg: string; border: string; text: string; icon: string }> = {
    compatible: { bg: "var(--bg-card)", border: "var(--border-color)", text: "var(--text-primary)", icon: "✓" },
    caution: { bg: "var(--color-flora-earth-200)", border: "var(--color-flora-earth)", text: "var(--color-flora-earth)", icon: "⚠" },
    conflict: { bg: "var(--color-flora-rose-100)", border: "var(--color-flora-rose-400)", text: "var(--color-flora-rose-500)", icon: "✕" },
};

function flowerName(f: Flower): string {
    return f.commonName ?? f.name;
}

export default function CompatibilityBadge({ result }: Props) {
    const style = LEVEL_STYLE[result.level];
    const pairs = [...result.conflicts, ...result.cautions];

    return (
        <div
        className="rounded-2xl border p-4 flex flex-col gap-2"
        style={{ background: style.bg, borderColor: style.border }}>
        <p className="text-sm flex items-start gap-2" style={{ color: style.text }}>
            <span>{style.icon}</span>
            <span>{result.message}</span>
        </p>

        {pairs.length > 0 && (
            <ul className="text-xs flex flex-col gap-1 pl-6 list-disc" style={{ color: style.text }}>
            {pairs.map((pair, i) => (
                <li key={i}>
                {flowerName(pair.flowerA)} e {flowerName(pair.flowerB)} — {pair.reason}
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
