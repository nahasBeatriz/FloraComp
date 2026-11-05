import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const arrangements = await prisma.arrangement.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                flowers: {
                    include: { flower: true },
                },
            },
        });

        const result = arrangements.map((a) => ({
            id: a.id,
            name: a.name,
            createdAt: a.createdAt.toISOString(),
            flowers: a.flowers.map((af) => ({
                flower: {
                    id: af.flower.id,
                    perenualId: af.flower.perenualId,
                    name: af.flower.name,
                    commonName: af.flower.commonName,
                    description: af.flower.description,
                    sunlight: af.flower.sunlight,
                    watering: af.flower.watering,
                    season: af.flower.season,
                    imageUrl: af.flower.imageUrl,
                },
                positionX: af.positionX,
                positionY: af.positionY,
            })),
        }));

        return NextResponse.json(result);
    } catch (err) {
        console.error("[GET /api/arrangements]", err);
        return NextResponse.json({ error: "Erro ao buscar arranjos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
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

        const arrangement = await prisma.arrangement.create({
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
            include: {
                flowers: { include: { flower: true } },
            },
        });

        return NextResponse.json(arrangement, { status: 201 });
    } catch (err) {
        console.error("[POST /api/arrangements]", err);
        return NextResponse.json({ error: "Erro ao salvar arranjo" }, { status: 500 });
    }
}