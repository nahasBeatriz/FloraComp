// Tipos que espelhamos da API Perenual
export type Sunlight = "full_sun" | "part_shade" | "full_shade";
export type Watering = "frequent" | "average" | "minimum";
export type Season = "spring" | "summer" | "fall" | "winter";

export interface Flower {
    id: number;
    perenualId?: number | null;
    name: string;
    commonName?: string | null;
    description?: string | null;
    sunlight: Sunlight;
    watering: Watering;
    season: Season;
    imageUrl?: string | null;
}

// Resposta da API Perenual
export interface PerenualFlower {
    id: number;
    common_name: string;
    scientific_name: string[];
    sunlight: string[];
    watering: string;
    flowering_season: string | null;
    description: string | null;
    default_image: {
        medium_url: string | null;
        small_url: string | null;
    } | null;
}

export interface PerenualListResponse {
    data: PerenualFlower[];
    to: number;
    per_page: number;
    current_page: number;
    from: number;
    last_page: number;
    total: number;
}