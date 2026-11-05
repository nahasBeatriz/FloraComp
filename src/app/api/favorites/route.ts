import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFlowerById } from "@/services/perenualApi";

export async function GET() {
    try {
        const favorites = await prisma.favorite.findMany({
            orderBy: { createdAt: "desc" },
        });

        // Busca os dados de cada flor na API Perenual em paralelo
        const results = await Promise.allSettled(
            favorites.map((fav) => fetchFlowerById(fav.perenualId))
        );

        const flowers = results
            .filter(
                (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchFlowerById>>> =>
                    r.status === "fulfilled"
            )
            .map((r) => r.value);

        return NextResponse.json(flowers);
    } catch (err) {
        console.error("[GET /api/favorites]", err);
        return NextResponse.json({ error: "Erro ao buscar favoritos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { perenualId } = await req.json();

        if (!perenualId || isNaN(Number(perenualId))) {
            return NextResponse.json({ error: "perenualId inválido" }, { status: 400 });
        }

        const favorite = await prisma.favorite.upsert({
            where: { perenualId: Number(perenualId) },
            update: {},
            create: { perenualId: Number(perenualId) },
        });

        return NextResponse.json(favorite, { status: 201 });
    } catch (err) {
        console.error("[POST /api/favorites]", err);
        return NextResponse.json({ error: "Erro ao favoritar" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { perenualId } = await req.json();

        if (!perenualId || isNaN(Number(perenualId))) {
            return NextResponse.json({ error: "perenualId inválido" }, { status: 400 });
        }

        await prisma.favorite.delete({ where: { perenualId: Number(perenualId) } });
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("[DELETE /api/favorites]", err);
        return NextResponse.json({ error: "Favorito não encontrado" }, { status: 404 });
    }
}