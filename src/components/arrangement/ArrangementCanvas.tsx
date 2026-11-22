"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ArrangementItem } from "@/types/arrangement";
import SortableFlower from "./SortableFlower";

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
        className="rounded-2xl border min-h-[420px] p-4 transition-colors"
        style={{
            background: "var(--bg-surface)",
            borderColor: isOver ? "var(--color-flora-green-600)" : "var(--border-color)",
        }}>
        {placed.length === 0 ? (
            <div
            className="flex flex-col items-center justify-center gap-2 h-full min-h-[380px]"
            style={{ color: "var(--text-secondary)" }}>
            <span className="text-4xl">☘</span>
            <p className="text-sm">Arraste as flores ao lado para esta área</p>
            </div>
        ) : (
            <SortableContext
            items={placed.map((p) => `placed-${p.key}`)}
            strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
                {placed.map(({ flower, key }) => (
                <SortableFlower
                    key={key}
                    placedKey={key}
                    flower={flower}
                    onRemove={() => onRemove(key)}/>
                ))}
            </ul>
            </SortableContext>
        )}
        </div>
    );
}
