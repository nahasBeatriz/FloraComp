import type { Flower } from "./flower";

export interface ArrangementItem {
    flower: Flower;
    positionX: number;
    positionY: number;
}

export interface Arrangement {
    id: number;
    name: string;
    createdAt: string;
    flowers: ArrangementItem[];
}

export interface CompatibilityResult {
    compatible: boolean;
    reason: string;
}