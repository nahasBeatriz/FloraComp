import { NextResponse } from "next/server";
import { fetchFlowers } from "@/services/perenualApi";
import type { Sunlight, Watering, Season } from "@/types/flower";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1");
    const search = searchParams.get("search") ?? "";
    const sunlight = (searchParams.get("sunlight") ?? "") as Sunlight | "";
    const watering = (searchParams.get("watering") ?? "") as Watering | "";
    const season = (searchParams.get("season") ?? "") as Season | "";

    try {
        const { flowers, lastPage } = await fetchFlowers({
        page,
        search,
        sunlight: sunlight || undefined,
        watering: watering || undefined,
        season: season || undefined,
        });

        return NextResponse.json({ data: flowers, lastPage, page });
    } catch (err) {
        console.error("[/api/flowers]", err);
        return NextResponse.json(
        { error: "Erro ao buscar flores da API" },
        { status: 500 }
        );
    }
}