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

function perenualToFlower(p: PerenualFlower): Flower {
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

// Busca uma página (30 itens) do species-list da Perenual, com reserva local
// em PerenualListCache quando a chamada ao vivo falha (cota diária esgotada,
// API fora do ar). Retorna null quando não há nem resposta nova nem reserva.
async function fetchSpeciesListPage(
    apiPage: number,
    filters: { search?: string; sunlight?: string; watering?: string }
): Promise<{ data: PerenualListResponse; stale: boolean } | null> {
    const { search, sunlight, watering } = filters;
    const listCacheKey = `${apiPage}:${search ?? ""}:${sunlight ?? ""}:${watering ?? ""}`;

    try {
        const query = new URLSearchParams({ key: API_KEY, page: String(apiPage) });
        if (search)   query.set("q", search);
        if (watering) query.set("watering", watering);
        if (sunlight) query.set("sunlight", sunlight);

        const res = await fetch(`${BASE_URL}/species-list?${query}`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`Perenual API error: ${res.status}`);

        const data: PerenualListResponse = await res.json();
        await prisma.perenualListCache.upsert({
            where: { key: listCacheKey },
            create: { key: listCacheKey, data: JSON.stringify(data) },
            update: { data: JSON.stringify(data), fetchedAt: new Date() },
        });
        return { data, stale: false };
    } catch {
        const cached = await prisma.perenualListCache.findUnique({ where: { key: listCacheKey } });
        if (!cached) return null;
        return { data: JSON.parse(cached.data), stale: true };
    }
}

interface SeasonMatchState {
    ids: number[];
    scannedApiPage: number;
    reachedEnd: boolean;
}

// Segurança: no máximo essa quantidade de páginas-API novas é varrida por
// requisição, pra um filtro de estação raro não gastar a cota do dia inteira
// numa visita só. O progresso fica salvo (ver abaixo), então clicar em
// "Próxima" de novo retoma a varredura de onde parou, em vez de do zero.
const SEASON_SCAN_PAGE_CAP = 5;

// A estação só vem no species/details, não é filtrável no species-list da
// Perenual: pra paginar o filtro de estação de verdade (sem página vazia
// seguida de página cheia, ver bug relatado), varremos o catálogo em ordem
// acumulando os ids que batem com a estação, guardando o progresso em
// PerenualListCache (chave prefixada "season:") pra não re-varrer do zero a
// cada requisição nem perder o que já foi descoberto quando a cota acaba no
// meio do caminho.
async function getSeasonMatches(
    season: string,
    filters: { search?: string; sunlight?: string; watering?: string },
    neededCount: number
): Promise<SeasonMatchState> {
    const key = `season:${season}:${filters.search ?? ""}:${filters.sunlight ?? ""}:${filters.watering ?? ""}`;
    const cached = await prisma.perenualListCache.findUnique({ where: { key } });
    const state: SeasonMatchState = cached
        ? JSON.parse(cached.data)
        : { ids: [], scannedApiPage: 0, reachedEnd: false };

    const save = () =>
        prisma.perenualListCache.upsert({
            where: { key },
            create: { key, data: JSON.stringify(state) },
            update: { data: JSON.stringify(state), fetchedAt: new Date() },
        });

    let pagesScanned = 0;
    while (state.ids.length < neededCount && !state.reachedEnd && pagesScanned < SEASON_SCAN_PAGE_CAP) {
        const apiPage = state.scannedApiPage + 1;
        const page = await fetchSpeciesListPage(apiPage, filters);
        if (!page) break; // sem resposta nova nem reserva local: para por aqui

        for (const p of page.data.data) {
            let flower: Flower;
            try {
                flower = await fetchFlowerById(p.id);
            } catch {
                // cota esgotada no meio da varredura: para tudo aqui, mantendo
                // scannedApiPage na página anterior pra retomar certo depois.
                await save();
                return state;
            }
            if (flower.season === season) state.ids.push(p.id);
        }

        state.scannedApiPage = apiPage;
        if (apiPage >= page.data.last_page) state.reachedEnd = true;
        pagesScanned++;
    }

    await save();
    return state;
}

export async function fetchFlowers(params: {
    page?: number;
    search?: string;
    sunlight?: string;
    watering?: string;
    season?: string;
} = {}): Promise<{ flowers: Flower[]; lastPage: number; stale?: boolean }> {
    const { page = 1, search, sunlight, watering, season } = params;

    if (season) {
        // Busca (ou continua buscando) ids suficientes pra preencher até a
        // página pedida; cada página devolvida já vem só com flores que
        // realmente batem com a estação, em vez de um recorte fixo de 10 itens
        // da Perenual filtrado depois (que podia dar página vazia à toa).
        const neededCount = page * APP_PAGE_SIZE;
        const state = await getSeasonMatches(season, { search, sunlight, watering }, neededCount);
        const pageIds = state.ids.slice((page - 1) * APP_PAGE_SIZE, page * APP_PAGE_SIZE);
        const flowers = (
            await Promise.all(pageIds.map((id) => fetchFlowerById(id).catch(() => null)))
        ).filter((f): f is Flower => f !== null);

        const knownPages = Math.max(1, Math.ceil(state.ids.length / APP_PAGE_SIZE));
        return {
            flowers,
            // Sem varrer o catálogo inteiro não dá pra saber o total exato de
            // páginas com essa estação; enquanto a varredura não chegou ao fim
            // (reachedEnd), deixamos lastPage uma página à frente da já
            // confirmada, só pra manter o botão "Próxima" disponível.
            lastPage: state.reachedEnd ? knownPages : knownPages + 1,
        };
    }

    // Cada página da Perenual (30 itens) vira SUB_PAGES_PER_API_PAGE páginas
    // do catálogo; páginas do catálogo que caem na mesma página da Perenual
    // reaproveitam o fetch cacheado dela (revalidate: 3600) em vez de gastar
    // uma nova requisição.
    const apiPage = Math.floor((page - 1) / SUB_PAGES_PER_API_PAGE) + 1;
    const offsetInApiPage = ((page - 1) % SUB_PAGES_PER_API_PAGE) * APP_PAGE_SIZE;

    const result = await fetchSpeciesListPage(apiPage, { search, sunlight, watering });
    if (!result) throw new Error("Perenual API error: sem resposta e sem reserva local");
    const { data, stale } = result;

    // Sem filtro de estação, devolvemos a listagem básica rapidamente; o card
    // busca rega/luz/estação sob demanda (ver FlowerCard).
    const pageItems = data.data.slice(offsetInApiPage, offsetInApiPage + APP_PAGE_SIZE);
    const flowers = pageItems.map(perenualToFlower);

    return {
        flowers,
        lastPage: data.last_page * SUB_PAGES_PER_API_PAGE,
        stale,
    };
}

// Todas as flores que já têm detalhe confirmado salvo localmente (ver
// PerenualDetailsCache acima). Usado pela sidebar de montar arranjo, que lê
// só daqui em vez de chamar a API ao vivo a cada busca (ver enrichDetailsCache
// pra popular esse cache aos poucos).
export async function fetchCachedFlowers(): Promise<Flower[]> {
    const cached = await prisma.perenualDetailsCache.findMany({
        orderBy: { commonName: "asc" },
    });
    return cached.map(cacheToFlower);
}

// Busca o detalhe de espécies que ainda não estão no PerenualDetailsCache,
// percorrendo o species-list da Perenual até achar `limit` novas ou a cota
// diária acabar (nesse caso para na hora, sem lançar erro, com o que já
// conseguiu enriquecer).
export async function enrichDetailsCache(
    limit: number
): Promise<{ enriched: number[]; stoppedEarly: boolean }> {
    const existing = await prisma.perenualDetailsCache.findMany({
        select: { perenualId: true },
    });
    const known = new Set(existing.map((c) => c.perenualId));

    const enriched: number[] = [];
    let stoppedEarly = false;
    let apiPage = 1;
    let lastPage = 1;

    outer: while (enriched.length < limit && apiPage <= lastPage) {
        const query = new URLSearchParams({ key: API_KEY, page: String(apiPage) });
        let listData: PerenualListResponse;
        try {
            const res = await fetch(`${BASE_URL}/species-list?${query}`, {
                next: { revalidate: 3600 },
            });
            if (!res.ok) throw new Error(`Perenual API error: ${res.status}`);
            listData = await res.json();
        } catch {
            stoppedEarly = true;
            break;
        }
        lastPage = listData.last_page;

        for (const p of listData.data) {
            if (known.has(p.id)) continue;
            try {
                await fetchFlowerById(p.id);
            } catch {
                stoppedEarly = true;
                break outer;
            }
            known.add(p.id);
            enriched.push(p.id);
            if (enriched.length >= limit) break outer;
        }

        apiPage++;
    }

    return { enriched, stoppedEarly };
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