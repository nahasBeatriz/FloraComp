"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import type { Flower } from "@/types/flower";

interface Props {
    placedKey: number;
    flower: Flower;
    onRemove: () => void;
}

export default function SortableFlower({ placedKey, flower, onRemove }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `placed-${placedKey}`,
        data: { type: "placed", key: placedKey },
    });

    return (
        <li
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="flex items-center gap-3 p-2 rounded-xl border cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.4 : 1,
        }}>
        <div
            className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0"
            style={{ background: "var(--border-color)" }}>
            {flower.imageUrl ? (
            <Image
                src={flower.imageUrl}
                alt={flower.commonName ?? flower.name}
                fill
                className="object-cover"
                sizes="56px"/>
            ) : (
            <div className="flex items-center justify-center h-full text-2xl">⚘</div>
            )}
        </div>
        <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {flower.commonName ?? flower.name}
        </span>
        <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: "var(--bg-surface)", color: "var(--text-secondary)" }}>
            ✕
        </button>
        </li>
    );
}
