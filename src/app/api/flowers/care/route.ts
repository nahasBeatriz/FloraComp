import { NextResponse } from "next/server";
import { fetchFlowerById } from "@/services/perenualApi";

// Dados de cuidado (luz/rega/estação) pra vários IDs em uma única chamada —
// o catálogo buscava isso card por card, o que multiplicava por 10 (tamanho
// da página) o número de requisições à Perenual a cada página vista.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ids = (searchParams.get("ids") ?? "")
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n));

    if (ids.length === 0) {
        return NextResponse.json({});
    }

    const results = await Promise.allSettled(ids.map((id) => fetchFlowerById(id)));

    const care: Record<number, { sunlight: string; watering: string; season: string | null }> = {};
    results.forEach((r, i) => {
        if (r.status === "fulfilled") {
            care[ids[i]] = {
                sunlight: r.value.sunlight,
                watering: r.value.watering,
                season: r.value.season,
            };
        }
    });

    return NextResponse.json(care);
}
