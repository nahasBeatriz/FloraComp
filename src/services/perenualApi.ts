import type { PerenualFlower, PerenualListResponse, Flower, Sunlight, Watering, Season } from "@/types/flower";

const API_KEY = process.env.PERENUAL_API_KEY!;
const BASE_URL = "https://perenual.com/api/v2";

// Converte os valores da Perenual para os nossos tipos
function mapSunlight(sunlight: string[]): Sunlight {
    const s = (sunlight[0] ?? "").toLowerCase();
    if (s.includes("full sun")) return "full_sun";
    if (s.includes("part") || s.includes("shade")) return "part_shade";
    return "full_shade";
}

function mapWatering(watering: string): Watering {
    const w = watering.toLowerCase();
    if (w === "frequent") return "frequent";
    if (w === "minimum" || w === "none") return "minimum";
    return "average";
}

function mapSeason(season: string | null): Season {
    const s = (season ?? "").toLowerCase();
    if (s.includes("spring")) return "spring";
    if (s.includes("summer")) return "summer";
    if (s.includes("fall") || s.includes("autumn")) return "fall";
    if (s.includes("winter")) return "winter";
    return "spring"; // fallback
}

export function perenualToFlower(p: PerenualFlower): Flower {
    return {
        id: p.id,
        perenualId: p.id,
        name: p.scientific_name[0] ?? p.common_name,
        commonName: p.common_name,
        description: p.description,
        sunlight: mapSunlight(p.sunlight),
        watering: mapWatering(p.watering),
        season: mapSeason(p.flowering_season),
        imageUrl: p.default_image?.medium_url ?? p.default_image?.small_url ?? null,
    };
}

export async function fetchFlowers(params: {
    page?: number;
    search?: string;
    sunlight?: string;
    watering?: string;
    season?: string;
    } = {}): Promise<{ flowers: Flower[]; lastPage: number }> {
    const { page = 1, search, sunlight, watering, season } = params;

    const query = new URLSearchParams({ key: API_KEY, page: String(page) });
    if (search)   query.set("q", search);
    if (watering) query.set("watering", watering);
    if (sunlight) query.set("sunlight", sunlight);
    if (season)   query.set("flowering_season", season);

    const res = await fetch(`${BASE_URL}/species-list?${query}`, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Perenual API error: ${res.status}`);

    const data: PerenualListResponse = await res.json();

    return {
        flowers: data.data.map(perenualToFlower),
        lastPage: data.last_page,
    };
}

export async function fetchFlowerById(id: number): Promise<Flower> {
    const res = await fetch(`${BASE_URL}/species/details/${id}?key=${API_KEY}`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Perenual API error: ${res.status}`);

    const data: PerenualFlower = await res.json();
    return perenualToFlower(data);
}