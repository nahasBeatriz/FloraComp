import { NextResponse } from "next/server";
import { fetchCachedFlowers } from "@/services/perenualApi";

export async function GET() {
    try {
        const flowers = await fetchCachedFlowers();
        return NextResponse.json({ data: flowers });
    } catch (err) {
        console.error("[/api/flowers/cached]", err);
        return NextResponse.json(
            { error: "Erro ao buscar flores em cache" },
            { status: 500 }
        );
    }
}
