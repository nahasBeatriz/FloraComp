import Link from "next/link";
import SeasonBanner from "@/components/seasonal/SeasonBanner";

const SECTIONS = [
    {
        href: "/catalog",
        icon: "❀",
        title: "Catálogo",
        description: "Explore centenas de espécies com filtros de luz, rega e estação.",
    },
    {
        href: "/arrangement",
        icon: "✐",
        title: "Montar Arranjo",
        description: "Combine flores visualmente e veja dicas de compatibilidade.",
    },
    {
        href: "/gallery",
        icon: "🀦",
        title: "Galeria",
        description: "Veja e relembre os arranjos que você já criou.",
    },
    {
        href: "/favorites",
        icon: "❤",
        title: "Favoritos",
        description: "Suas flores favoritas reunidas em um só lugar.",
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col gap-12 pb-16">
        <section
            className="py-20 px-4 text-center"
            style={{ background: "var(--bg-surface)" }}>
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <span className="text-6xl">𖡼.𖤣𖥧𖡼.𖤣𖥧</span>
            <h1
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
                FloraComp
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Explore flores, crie arranjos personalizados e descubra dicas
                sazonais de cultivo.
            </p>
            <Link
                href="/catalog"
                className="px-8 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-flora-green-700)" }}>
                Explorar catálogo
            </Link>
            </div>
        </section>

        <SeasonBanner />

        <section className="max-w-7xl mx-auto px-4 w-full">
            <h2
            className="text-xl font-semibold mb-6"
            style={{ color: "var(--text-primary)" }}>
            O que você quer fazer hoje?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTIONS.map((s) => (
                <Link
                key={s.href}
                href={s.href}
                className="rounded-2xl border p-6 flex flex-col gap-3 transition-shadow hover:shadow-md"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <span className="text-3xl">{s.icon}</span>
                <h3
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}>
                    {s.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {s.description}
                </p>
                </Link>
            ))}
            </div>
        </section>
        </div>
    );
}