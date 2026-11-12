"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import type { Flower } from "@/types/flower";

interface Props {
    placedKey: number;
    flower: Flower;
    x: number;
    y: number;
    onRemove: () => void;
}

export default function DraggableFlower({ placedKey, flower, x, y, onRemove }: Props) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `placed-${placedKey}`,
        data: { type: "placed", key: placedKey },
    });

    return (
        <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="absolute flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
            left: x,
            top: y,
            transform: CSS.Translate.toString(transform),
            zIndex: isDragging ? 20 : 1,
        }}>
        <div
            className="relative w-20 h-20 rounded-xl overflow-hidden border"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            {flower.imageUrl ? (
            <Image
                src={flower.imageUrl}
                alt={flower.commonName ?? flower.name}
                fill
                className="object-cover"
                sizes="80px"/>
            ) : (
            <div className="flex items-center justify-center h-full text-3xl">⚘</div>
            )}
            <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            ✕
            </button>
        </div>
        <span
            className="text-xs text-center max-w-20 leading-tight pointer-events-none"
            style={{ color: "var(--text-secondary)" }}>
            {flower.commonName ?? flower.name}
        </span>
        </div>
    );
}
