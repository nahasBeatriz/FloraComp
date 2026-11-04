import { NextResponse } from "next/server";
import { fetchFlowerById } from "@/services/perenualApi";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const { id } = await params;
    const numId = Number(id);

    if (isNaN(numId)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        const flower = await fetchFlowerById(numId);
        return NextResponse.json(flower);
    } catch (err) {
        console.error("[/api/flowers/[id]]", err);
        return NextResponse.json({ error: "Flor não encontrada" }, { status: 404 });
    }
}