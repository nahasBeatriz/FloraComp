import { NextResponse } from "next/server";
import { fetchFlowers } from "@/services/perenualApi";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? "1");
    const search = searchParams.get("search") ?? undefined;
    const sunlight = searchParams.get("sunlight") ?? undefined;
    const watering = searchParams.get("watering") ?? undefined;
    const season = searchParams.get("season") ?? undefined;

    try {
        const { flowers, lastPage } = await fetchFlowers({
            page,
            search,
            sunlight,
            watering,
            season,
        });

        return NextResponse.json({ data: flowers, lastPage });
    } catch (err) {
        console.error("[/api/flowers]", err);
        return NextResponse.json(
            { error: "Erro ao buscar flores" },
            { status: 500 }
        );
    }
}