"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import type { Flower, Season } from "@/types/flower";
import type { ArrangementItem } from "@/types/arrangement";
import { SUNLIGHT_LABELS, WATERING_LABELS, SEASON_LABELS } from "@/constants/filters";
import { checkCompatibility } from "@/utils/compatibility";
import CompatibilityBadge from "@/components/arrangement/CompatibilityBadge";
import ArrangementCanvas, { CANVAS_DROPPABLE_ID } from "@/components/arrangement/ArrangementCanvas";

interface PlacedFlower extends ArrangementItem {
    key: number;
}

type DragData =
    | { type: "sidebar"; flower: Flower }
    | { type: "placed"; key: number };

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// Caixa de 80x80 (w-20 h-20) usada pela miniatura de cada flor no canvas.
const PLACED_ITEM_SIZE = 80;

function CatalogItem({ flower, onAdd }: { flower: Flower; onAdd: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${flower.perenualId ?? flower.id}`,
        data: { type: "sidebar", flower } satisfies DragData,
    });

    return (
        <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={onAdd}
        className="flex items-center gap-3 p-2 rounded-xl text-left transition-colors hover:opacity-80 cursor-grab active:cursor-grabbing touch-none"
        style={{ background: "var(--bg-surface)", opacity: isDragging ? 0.4 : 1 }}>
        <div
            className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
            style={{ background: "var(--border-color)" }}>
            {flower.imageUrl ? (
            <Image
                src={flower.imageUrl}
                alt={flower.commonName ?? flower.name}
                fill
                className="object-cover"
                sizes="40px"/>
            ) : (
            <div className="flex items-center justify-center h-full text-lg">꩜</div>
            )}
        </div>
        <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {flower.commonName ?? flower.name}
            </span>
            <span className="text-xs truncate italic" style={{ color: "var(--text-secondary)" }}>
            {flower.name}
            </span>
        </div>
        <span className="ml-auto text-lg shrink-0 pointer-events-none">＋</span>
        </button>
    );
}

function dominantCare(flowers: Flower[]) {
    if (flowers.length === 0) return null;
    const count = <T extends string>(arr: T[]): T | null => {
        if (arr.length === 0) return null;
        const freq: Record<string, number> = {};
        arr.forEach((v) => { freq[v] = (freq[v] ?? 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as T;
    };
    return {
        sunlight: count(flowers.map((f) => f.sunlight))!,
        watering: count(flowers.map((f) => f.watering))!,
        season: count(flowers.map((f) => f.season).filter((s): s is Season => s !== null)),
    };
}

function ArrangementContent() {
    const searchParams = useSearchParams();
    const preAddId = searchParams.get("add");
    const [catalog, setCatalog] = useState<Flower[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [placed, setPlaced] = useState<PlacedFlower[]>([]);
    const counterRef = useRef(0);
    const [arrangementName, setArrangementName] = useState("Meu Arranjo");
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState("");
    const [activeDragFlower, setActiveDragFlower] = useState<Flower | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const fetchCatalog = useCallback(async (q = "") => {
        setLoadingCatalog(true);
        try {
            const params = new URLSearchParams({ page: "1" });
            if (q) params.set("search", q);
            const res = await fetch(`/api/flowers?${params}`);
            const json = await res.json();
            setCatalog(json.data ?? []);
        } finally {
            setLoadingCatalog(false);
        }
    }, []);

    useEffect(() => { fetchCatalog(); }, [fetchCatalog]);
    useEffect(() => {
        if (!preAddId || catalog.length === 0) return;
        const flower = catalog.find(
        (f) => String(f.perenualId ?? f.id) === preAddId
        );
        if (flower) addFlower(flower);
    }, [preAddId, catalog]);

    useEffect(() => {
        const timer = setTimeout(() => fetchCatalog(search), 400);
        return () => clearTimeout(timer);
    }, [search, fetchCatalog]);

    async function addFlower(flower: Flower, position?: { x: number; y: number }) {
        const key = counterRef.current++;
        setSaved(false);

        // A listagem do catálogo vem rápida, sem rega/luz confirmados (ver
        // FlowerCard). Buscamos o dado real antes de colocar no arranjo, pra
        // compatibilidade e resumo de cuidados não trabalharem com valores
        // padrão errados.
        let confirmed = flower;
        try {
            const res = await fetch(`/api/flowers/${flower.perenualId ?? flower.id}`);
            if (res.ok) confirmed = await res.json();
        } catch {}

        setPlaced((prev) => {
            // Sem posição explícita (clique em vez de arrastar), espalha em
            // uma grade simples pra não empilhar tudo no canto.
            const index = prev.length;
            const { x, y } = position ?? {
                x: 16 + (index % 5) * 92,
                y: 16 + Math.floor(index / 5) * 92,
            };
            return [...prev, { flower: confirmed, key, positionX: x, positionY: y }];
        });
    }

    function removeFlower(key: number) {
        setPlaced((prev) => prev.filter((p) => p.key !== key));
        setSaved(false);
    }

    function handleDragStart(event: DragStartEvent) {
        const data = event.active.data.current as DragData | undefined;
        if (!data) return;
        if (data.type === "sidebar") {
            setActiveDragFlower(data.flower);
        } else {
            setActiveDragFlower(placed.find((p) => p.key === data.key)?.flower ?? null);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveDragFlower(null);
        const { active, over, delta } = event;
        if (!over || over.id !== CANVAS_DROPPABLE_ID) return;

        const data = active.data.current as DragData | undefined;
        if (!data) return;

        const maxX = Math.max(0, over.rect.width - PLACED_ITEM_SIZE);
        const maxY = Math.max(0, over.rect.height - PLACED_ITEM_SIZE);

        if (data.type === "sidebar") {
            const translated = active.rect.current.translated;
            if (!translated) return;
            addFlower(data.flower, {
                x: clamp(translated.left - over.rect.left, 0, maxX),
                y: clamp(translated.top - over.rect.top, 0, maxY),
            });
        } else {
            setPlaced((prev) => prev.map((p) => p.key !== data.key ? p : {
                ...p,
                positionX: clamp(p.positionX + delta.x, 0, maxX),
                positionY: clamp(p.positionY + delta.y, 0, maxY),
            }));
        }
    }

    // Salva o arranjo no banco via API
    async function saveArrangement() {
        if (placed.length === 0) return;
        try {
            const res = await fetch("/api/arrangements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: arrangementName,
                    flowers: placed.map((p) => ({
                        flower: p.flower,
                        positionX: p.positionX,
                        positionY: p.positionY,
                    })),
                }),
            });
            if (res.ok) setSaved(true);
        } catch {
            console.error("Erro ao salvar arranjo");
        }
    }

    const compat = checkCompatibility(placed.map((p) => p.flower));
    const care = dominantCare(placed.map((p) => p.flower));

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
        <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            Montar Arranjo
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            Escolha flores do catálogo e monte sua composição
        </p>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
            <div
            className="w-full lg:w-72 shrink-0 rounded-2xl border p-4 flex flex-col gap-3"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Flores disponíveis
            </h2>
            <p className="text-xs -mt-2" style={{ color: "var(--text-secondary)" }}>
                Arraste pro canvas ou clique pra adicionar
            </p>
            <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
                style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
                }}/>

            {loadingCatalog ? (
                <div className="flex justify-center py-6">
                <span className="text-2xl animate-spin">꩜</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
                {catalog.map((flower) => (
                    <CatalogItem
                    key={flower.perenualId ?? flower.id}
                    flower={flower}
                    onAdd={() => addFlower(flower)}/>
                ))}
                </div>
            )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                type="text"
                value={arrangementName}
                onChange={(e) => setArrangementName(e.target.value)}
                className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold border outline-none"
                style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                }}/>
                <div className="flex gap-2">
                <button
                    onClick={() => { setPlaced([]); setSaved(false); }}
                    className="px-4 py-2 rounded-xl text-sm border"
                    style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                    }}>
                    Limpar
                </button>
                <button
                    onClick={saveArrangement}
                    disabled={placed.length === 0}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                    {saved ? "Salvo!" : "Salvar"}
                </button>
                </div>
            </div>

            <ArrangementCanvas placed={placed} onRemove={removeFlower} />

            {placed.length > 0 && <CompatibilityBadge result={compat} />}

            {care && (
                <div
                className="rounded-2xl border p-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}>
                    Resumo de cuidados do arranjo
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Luz predominante</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {SUNLIGHT_LABELS[care.sunlight]}
                    </p>
                    </div>
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Rega predominante</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {WATERING_LABELS[care.watering]}
                    </p>
                    </div>
                    <div>
                    <p style={{ color: "var(--text-secondary)" }}>Estação principal</p>
                    <p className="font-medium mt-1" style={{ color: "var(--text-primary)" }}>
                        {care.season ? SEASON_LABELS[care.season] : "—"}
                    </p>
                    </div>
                </div>
                </div>
            )}

            {saved && (
                <Link
                href="/gallery"
                className="text-sm text-center font-medium underline"
                style={{ color: "var(--color-flora-green-600)" }}>
                Ver na galeria
                </Link>
            )}
            </div>
        </div>

        <DragOverlay>
            {activeDragFlower && (
            <div
                className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-lg"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                {activeDragFlower.imageUrl ? (
                <Image
                    src={activeDragFlower.imageUrl}
                    alt={activeDragFlower.commonName ?? activeDragFlower.name}
                    fill
                    className="object-cover"
                    sizes="80px"/>
                ) : (
                <div className="flex items-center justify-center h-full text-3xl">⚘</div>
                )}
            </div>
            )}
        </DragOverlay>
        </DndContext>
        </main>
    );
}

export default function ArrangementPage() {
    return (
        <Suspense fallback={
        <div className="flex justify-center items-center min-h-96">
            <span className="text-4xl animate-spin">಄</span>
        </div>
        }>
        <ArrangementContent />
        </Suspense>
    );
}