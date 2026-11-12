"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ArrangementItem } from "@/types/arrangement";
import DraggableFlower from "./DraggableFlower";

interface Props {
    placed: (ArrangementItem & { key: number })[];
    onRemove: (key: number) => void;
}

export const CANVAS_DROPPABLE_ID = "canvas";

export default function ArrangementCanvas({ placed, onRemove }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id: CANVAS_DROPPABLE_ID });

    return (
        <div
        ref={setNodeRef}
        className="relative rounded-2xl border min-h-[420px] overflow-hidden transition-colors"
        style={{
            background: "var(--bg-surface)",
            borderColor: isOver ? "var(--color-flora-green-600)" : "var(--border-color)",
        }}>
        {placed.length === 0 && (
            <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
            style={{ color: "var(--text-secondary)" }}>
            <span className="text-4xl">☘</span>
            <p className="text-sm">Arraste as flores ao lado para esta área</p>
            </div>
        )}

        {placed.map(({ flower, key, positionX, positionY }) => (
            <DraggableFlower
            key={key}
            placedKey={key}
            flower={flower}
            x={positionX}
            y={positionY}
            onRemove={() => onRemove(key)}/>
        ))}
        </div>
    );
}
