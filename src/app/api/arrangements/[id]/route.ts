import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        const arrangement = await prisma.arrangement.findUnique({
            where: { id: numId },
            include: {
                flowers: { include: { flower: true } },
            },
        });

        if (!arrangement) {
            return NextResponse.json({ error: "Arranjo não encontrado" }, { status: 404 });
        }

        return NextResponse.json({
            id: arrangement.id,
            name: arrangement.name,
            createdAt: arrangement.createdAt.toISOString(),
            flowers: arrangement.flowers.map((af) => ({
                flower: af.flower,
                positionX: af.positionX,
                positionY: af.positionY,
            })),
        });
    } catch (err) {
        console.error("[GET /api/arrangements/[id]]", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numId = Number(id);

    if (isNaN(numId)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        await prisma.arrangement.delete({ where: { id: numId } });
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("[DELETE /api/arrangements/[id]]", err);
        return NextResponse.json({ error: "Arranjo não encontrado" }, { status: 404 });
    }
}