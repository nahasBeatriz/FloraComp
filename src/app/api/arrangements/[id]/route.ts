import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

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

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const numId = Number(id);

    if (isNaN(numId)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { name, flowers } = body as {
            name: string;
            flowers: {
                flower: {
                    id?: number;
                    perenualId?: number | null;
                    name: string;
                    commonName?: string | null;
                    description?: string | null;
                    sunlight: string;
                    watering: string;
                    season: string;
                    imageUrl?: string | null;
                };
                positionX: number;
                positionY: number;
            }[];
        };

        if (!name || !Array.isArray(flowers)) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        // Upsert cada flor pelo perenualId (ou cria uma nova local)
        const flowerIds: { id: number; positionX: number; positionY: number }[] = [];

        for (const item of flowers) {
            let dbFlower;

            if (item.flower.perenualId) {
                dbFlower = await prisma.flower.upsert({
                    where: { perenualId: item.flower.perenualId },
                    update: {},
                    create: {
                        perenualId: item.flower.perenualId,
                        name: item.flower.name,
                        commonName: item.flower.commonName,
                        description: item.flower.description,
                        sunlight: item.flower.sunlight,
                        watering: item.flower.watering,
                        season: item.flower.season,
                        imageUrl: item.flower.imageUrl,
                    },
                });
            } else {
                dbFlower = await prisma.flower.create({
                    data: {
                        name: item.flower.name,
                        commonName: item.flower.commonName,
                        description: item.flower.description,
                        sunlight: item.flower.sunlight,
                        watering: item.flower.watering,
                        season: item.flower.season,
                        imageUrl: item.flower.imageUrl,
                    },
                });
            }

            flowerIds.push({ id: dbFlower.id, positionX: item.positionX, positionY: item.positionY });
        }

        const [, arrangement] = await prisma.$transaction([
            prisma.arrangementFlower.deleteMany({ where: { arrangementId: numId } }),
            prisma.arrangement.update({
                where: { id: numId },
                data: {
                    name,
                    flowers: {
                        create: flowerIds.map((f) => ({
                            flowerId: f.id,
                            positionX: f.positionX,
                            positionY: f.positionY,
                        })),
                    },
                },
                include: { flowers: { include: { flower: true } } },
            }),
        ]);

        return NextResponse.json(arrangement);
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return NextResponse.json({ error: "Arranjo não encontrado" }, { status: 404 });
        }
        console.error("[PUT /api/arrangements/[id]]", err);
        return NextResponse.json({ error: "Erro ao atualizar arranjo" }, { status: 500 });
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