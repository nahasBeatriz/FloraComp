import { NextRequest, NextResponse } from "next/server";
import { fetchFlowers } from "@/services/perenualApi";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    const page     = searchParams.get("page")     ?? "1";
    const search   = searchParams.get("search")   ?? undefined;
    const sunlight = searchParams.get("sunlight") ?? undefined;
    const watering = searchParams.get("watering") ?? undefined;
    const season   = searchParams.get("season")   ?? undefined;

    try {
        const { flowers, lastPage } = await fetchFlowers({
        page: Number(page),
        search,
        sunlight,
        watering,
        season,
        });

        return NextResponse.json({ data: flowers, lastPage });
    } catch (err) {
        console.error("Erro ao buscar flores:", err);
        return NextResponse.json(
        { error: "Erro ao buscar flores da API" },
        { status: 500 }
        );
    }
}