import type { Flower, Sunlight, Watering } from "@/types/flower";
import { SUNLIGHT_LABELS, WATERING_LABELS } from "@/constants/filters";

export type CompatibilityLevel = "compatible" | "caution" | "conflict";

export interface CompatibilityPair {
    flowerA: Flower;
    flowerB: Flower;
    reason: string;
}

export interface CompatibilityResult {
    level: CompatibilityLevel;
    message: string;
    // Pares com necessidades opostas (ex.: sol pleno x sombra total).
    conflicts: CompatibilityPair[];
    // Pares com necessidades só parcialmente diferentes (ex.: sol pleno x meia-sombra).
    cautions: CompatibilityPair[];
}

// Ordem crescente de intensidade, para medir o quão longe duas flores estão
// uma da outra em cada necessidade (0 = igual, 1 = parcialmente diferente,
// 2 = extremos opostos).
const WATERING_ORDER: Record<Watering, number> = { minimum: 0, average: 1, frequent: 2 };
const SUNLIGHT_ORDER: Record<Sunlight, number> = { full_shade: 0, part_shade: 1, full_sun: 2 };

export function checkCompatibility(flowers: Flower[]): CompatibilityResult {
    if (flowers.length < 2) {
        return {
            level: "compatible",
            message: "Adicione pelo menos 2 flores para ver a compatibilidade.",
            conflicts: [],
            cautions: [],
        };
    }

    const conflicts: CompatibilityPair[] = [];
    const cautions: CompatibilityPair[] = [];

    for (let i = 0; i < flowers.length; i++) {
        for (let j = i + 1; j < flowers.length; j++) {
            const a = flowers[i];
            const b = flowers[j];

            const wateringGap = Math.abs(WATERING_ORDER[a.watering] - WATERING_ORDER[b.watering]);
            if (wateringGap === 2) {
                conflicts.push({ flowerA: a, flowerB: b, reason: wateringReason(a, b) });
            } else if (wateringGap === 1) {
                cautions.push({ flowerA: a, flowerB: b, reason: wateringReason(a, b) });
            }

            const sunlightGap = Math.abs(SUNLIGHT_ORDER[a.sunlight] - SUNLIGHT_ORDER[b.sunlight]);
            if (sunlightGap === 2) {
                conflicts.push({ flowerA: a, flowerB: b, reason: sunlightReason(a, b) });
            } else if (sunlightGap === 1) {
                cautions.push({ flowerA: a, flowerB: b, reason: sunlightReason(a, b) });
            }
        }
    }

    if (conflicts.length > 0) {
        return {
            level: "conflict",
            message: conflicts.length === 1
                ? "1 combinação incompatível encontrada."
                : `${conflicts.length} combinações incompatíveis encontradas.`,
            conflicts,
            cautions,
        };
    }

    if (cautions.length > 0) {
        return {
            level: "caution",
            message: "As flores combinam, mas algumas têm necessidades um pouco diferentes.",
            conflicts,
            cautions,
        };
    }

    return {
        level: "compatible",
        message: "Boa combinação! Essas flores têm necessidades compatíveis.",
        conflicts,
        cautions,
    };
}

function wateringReason(a: Flower, b: Flower): string {
    return `${WATERING_LABELS[a.watering]} x ${WATERING_LABELS[b.watering]}`;
}

function sunlightReason(a: Flower, b: Flower): string {
    return `${SUNLIGHT_LABELS[a.sunlight]} x ${SUNLIGHT_LABELS[b.sunlight]}`;
}
