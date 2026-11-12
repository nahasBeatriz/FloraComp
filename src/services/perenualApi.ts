import { prisma } from "@/lib/prisma";
import type { PerenualDetailsCacheModel } from "@/generated/prisma/models";
import type { PerenualFlower, PerenualListResponse, Flower, Sunlight, Watering, Season } from "@/types/flower";

const API_KEY = process.env.PERENUAL_API_KEY!;
const BASE_URL = "https://perenual.com/api/v2";

// Tamanho de página exibido no catálogo. É menor que o per_page fixo da
// Perenual (30) para economizar requisições de detalhe por carregamento;
// cada página da Perenual vira várias páginas do catálogo (ver fetchFlowers).
const APP_PAGE_SIZE = 10;
const API_PAGE_SIZE = 30;
const SUB_PAGES_PER_API_PAGE = Math.ceil(API_PAGE_SIZE / APP_PAGE_SIZE);

// A API Perenual (plano gratuito) libera só 100 requisições/dia, então os
// detalhes buscados de cada planta (rega, luz, estação) ficam guardados na
// tabela PerenualDetailsCache e só são buscados de novo depois desse prazo.
const DETAILS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cacheToFlower(c: PerenualDetailsCacheModel): Flower {
    return {
        id: c.perenualId,
        perenualId: c.perenualId,
        name: c.name,
        commonName: c.commonName,
        description: c.description,
        sunlight: c.sunlight as Sunlight,
        watering: c.watering as Watering,
        season: c.season as Season | null,
        imageUrl: c.imageUrl,
    };
}

function mapSunlight(sunlight: string[] | null | undefined): Sunlight {
    const s = (sunlight?.[0] ?? "").toLowerCase();
    if (s.includes("full sun")) return "full_sun";
    if (s.includes("full shade")) return "full_shade";
    if (s.includes("part") || s.includes("shade")) return "part_shade";
    return "full_shade";
}

function mapWatering(watering: string | null | undefined): Watering {
    const w = (watering ?? "").toLowerCase();
    if (w === "frequent") return "frequent";
    if (w === "minimum" || w === "none") return "minimum";
    return "average";
}

function mapSeason(season: string | null): Season | null {
    const s = (season ?? "").toLowerCase();
    if (s.includes("spring")) return "spring";
    if (s.includes("summer")) return "summer";
    if (s.includes("fall") || s.includes("autumn")) return "fall";
    if (s.includes("winter")) return "winter";
    return null;
}

function cleanImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.includes("upgrade_access")) return null;
    return url;
}

export function perenualToFlower(p: PerenualFlower): Flower {
    return {
        id: p.id,
        perenualId: p.id,
        name: p.scientific_name?.[0] ?? p.common_name,
        commonName: p.common_name,
        description: p.description,
        sunlight: mapSunlight(p.sunlight),
        watering: mapWatering(p.watering),
        season: mapSeason(p.flowering_season),
        imageUrl: cleanImageUrl(p.default_image?.medium_url ?? p.default_image?.small_url),
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

    // Cada página da Perenual (30 itens) vira SUB_PAGES_PER_API_PAGE páginas
    // do catálogo; páginas do catálogo que caem na mesma página da Perenual
    // reaproveitam o fetch cacheado dela (revalidate: 3600) em vez de gastar
    // uma nova requisição.
    const apiPage = Math.floor((page - 1) / SUB_PAGES_PER_API_PAGE) + 1;
    const offsetInApiPage = ((page - 1) % SUB_PAGES_PER_API_PAGE) * APP_PAGE_SIZE;

    const query = new URLSearchParams({ key: API_KEY, page: String(apiPage) });
    if (search)   query.set("q", search);
    if (watering) query.set("watering", watering);
    if (sunlight) query.set("sunlight", sunlight);

    const res = await fetch(`${BASE_URL}/species-list?${query}`, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Perenual API error: ${res.status}`);

    const data: PerenualListResponse = await res.json();
    const pageItems = data.data.slice(offsetInApiPage, offsetInApiPage + APP_PAGE_SIZE);

    let flowers: Flower[];
    if (season) {
        // flowering_season só vem no species/details, e não é filtrável no
        // species-list, então buscamos o detalhe de cada item desta página
        // (no máximo APP_PAGE_SIZE) e filtramos aqui.
        flowers = await Promise.all(
            pageItems.map((p) => fetchFlowerById(p.id).catch(() => perenualToFlower(p)))
        );
        flowers = flowers.filter((f) => f.season === season);
    } else {
        // Sem filtro de estação, devolvemos a listagem básica rapidamente;
        // o card busca rega/luz/estação sob demanda (ver FlowerCard).
        flowers = pageItems.map(perenualToFlower);
    }

    return {
        flowers,
        lastPage: data.last_page * SUB_PAGES_PER_API_PAGE,
    };
}

export async function fetchFlowerById(id: number): Promise<Flower> {
    const cached = await prisma.perenualDetailsCache.findUnique({ where: { perenualId: id } });
    if (cached && Date.now() - cached.fetchedAt.getTime() < DETAILS_CACHE_TTL_MS) {
        return cacheToFlower(cached);
    }

    const res = await fetch(`${BASE_URL}/species/details/${id}?key=${API_KEY}`, {
        next: { revalidate: 3600 },
    });

    if (!res.ok) {
        // Sem dados novos (ex.: limite diário da API atingido) usamos o cache
        // antigo em vez de quebrar o catálogo, se houver algum disponível.
        if (cached) return cacheToFlower(cached);
        throw new Error(`Perenual API error: ${res.status}`);
    }

    const data: PerenualFlower = await res.json();
    const flower = perenualToFlower(data);

    const flowerData = {
        name: flower.name,
        commonName: flower.commonName,
        description: flower.description,
        sunlight: flower.sunlight,
        watering: flower.watering,
        season: flower.season,
        imageUrl: flower.imageUrl,
    };
    await prisma.perenualDetailsCache.upsert({
        where: { perenualId: id },
        create: { perenualId: id, ...flowerData },
        update: { ...flowerData, fetchedAt: new Date() },
    });

    return flower;
}