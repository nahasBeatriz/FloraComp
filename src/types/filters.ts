import type { Season, Sunlight, Watering } from "./flower";

export interface FlowerFilters {
    search: string;
    sunlight: Sunlight | "";
    watering: Watering | "";
    season: Season | "";
}

export const DEFAULT_FILTERS: FlowerFilters = {
    search: "",
    sunlight: "",
    watering: "",
    season: "",
};