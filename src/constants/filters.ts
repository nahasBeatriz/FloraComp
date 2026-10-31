import type { Season, Sunlight, Watering } from "@/types/flower";

export const SUNLIGHT_OPTIONS: { value: Sunlight; label: string; icon: string }[] = [
    { value: "full_sun", label: "Sol pleno", icon: "" },
    { value: "part_shade", label: "Meia sombra", icon: "" },
    { value: "full_shade", label: "Sombra total", icon: "" },
];

export const WATERING_OPTIONS: { value: Watering; label: string; icon: string }[] = [
    { value: "frequent", label: "Frequente", icon: "" },
    { value: "average", label: "Moderada", icon: "" },
    { value: "minimum", label: "Mínima", icon: "" },
];

export const SEASON_OPTIONS: { value: Season; label: string; icon: string }[] = [
    { value: "spring", label: "Primavera", icon: "" },
    { value: "summer", label: "Verão", icon: "" },
    { value: "fall", label: "Outono", icon: "" },
    { value: "winter", label: "Inverno", icon: "" },
];

export const SEASON_LABELS: Record<Season, string> = {
    spring: "Primavera",
    summer: "Verão",
    fall: "Outono",
    winter: "Inverno",
};

export const SUNLIGHT_LABELS: Record<Sunlight, string> = {
    full_sun: "Sol pleno",
    part_shade: "Meia sombra",
    full_shade: "Sombra total",
};

export const WATERING_LABELS: Record<Watering, string> = {
    frequent: "Rega frequente",
    average: "Rega moderada",
    minimum: "Rega mínima",
};