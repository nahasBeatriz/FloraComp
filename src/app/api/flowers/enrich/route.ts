import { NextResponse } from "next/server";
import { enrichDetailsCache } from "@/services/perenualApi";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Rota de manutenção: busca detalhe de espécies ainda não cacheadas pra
// engordar o PerenualDetailsCache que alimenta a sidebar de montar arranjo
// (ver /api/flowers/cached). Não é usada pela UI.
export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const parsedLimit = Number(searchParams.get("limit"));
    const limit = Math.min(
        Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
        MAX_LIMIT
    );

    try {
        const { enriched, stoppedEarly } = await enrichDetailsCache(limit);
        return NextResponse.json({ enriched: enriched.length, ids: enriched, stoppedEarly });
    } catch (err) {
        console.error("[/api/flowers/enrich]", err);
        return NextResponse.json(
            { error: "Erro ao enriquecer cache" },
            { status: 500 }
        );
    }
}
