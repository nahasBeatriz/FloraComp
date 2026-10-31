import Link from "next/link";
import SeasonBanner from "@/components/seasonal/SeasonBanner";

const FEATURES = [
    {
        href: "/catalog",
        icon: "🌺",
        title: "Catálogo de Flores",
        description: "Explore centenas de espécies com filtros por luminosidade, frequência de rega e estação ideal.",
        cta: "Ver catálogo",
        accent: "#2d6a4f",
    },
    {
        href: "/arrangement",
        icon: "✂️",
        title: "Montar Arranjo",
        description: "Arraste flores para a área de composição e receba feedback de compatibilidade em tempo real.",
        cta: "Criar arranjo",
        accent: "#c9848a",
    },
    {
        href: "/gallery",
        icon: "🖼️",
        title: "Minha Galeria",
        description: "Seus arranjos salvos com ficha consolidada de cuidados para cada composição.",
        cta: "Ver galeria",
        accent: "#8b6e52",
    },
    {
        href: "/favorites",
        icon: "❤️",
        title: "Favoritas",
        description: "Suas flores favoritas salvas para consultar rapidamente na hora de montar um novo arranjo.",
        cta: "Ver favoritas",
        accent: "#40916c",
    },
];

export default function HomePage() {
    return (
        <div>
        {/* Hero */}
        <section
            className="relative overflow-hidden py-20 px-4"
            style={{
            background: "linear-gradient(135deg, var(--color-flora-green-900) 0%, var(--color-flora-green-700) 60%, var(--color-flora-green-400) 100%)",
            }}>
            {/* Decoração de fundo */}
            <div className="absolute inset-0 opacity-10 text-9xl select-none flex flex-wrap gap-8 p-8 overflow-hidden leading-none pointer-events-none" aria-hidden>
            {["🌸", "🌺", "🌻", "🌹", "🌼", "🌷", "🪷", "💐", "🌸", "🌺", "🌻"].map((f, i) => (
                <span key={i}>{f}</span>
            ))}
            </div>

            <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3">
                Programação de Aplicações Web
            </p>
            <h1
                className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "Georgia, serif" }}>
                FloraComp
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto">
                Explore flores, crie arranjos personalizados e descubra quais espécies combinam entre si.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
                <Link
                href="/catalog"
                className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: "white", color: "var(--color-flora-green-800)" }}
                >
                🌺 Explorar catálogo
                </Link>
                <Link
                href="/arrangement"
                className="px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105 border border-white/40"
                style={{ backgroundColor: "transparent", color: "white" }}>
                Criar arranjo
                </Link>
            </div>
            </div>
        </section>

        {/* Banner da estação atual */}
        <SeasonBanner />

        {/* Cards de funcionalidades */}
        <section className="max-w-7xl mx-auto px-4 py-16">
            <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
            O que você pode fazer
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat) => (
                <Link
                key={feat.href}
                href={feat.href}
                className="group rounded-2xl p-6 flex flex-col gap-3 border transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <span className="text-4xl">{feat.icon}</span>
                <h3
                    className="font-bold text-base"
                    style={{ color: "var(--text-primary)", fontFamily: "Georgia, serif" }}>
                    {feat.title}
                </h3>
                <p className="text-sm flex-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {feat.description}
                </p>
                <span
                    className="text-sm font-semibold mt-1 group-hover:underline"
                    style={{ color: feat.accent }}>
                    {feat.cta} →
                </span>
                </Link>
            ))}
            </div>
        </section>

        {/* Sobre a API */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
            <div
            className="rounded-2xl px-8 py-8 flex flex-col md:flex-row items-center gap-6 border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
            <div className="text-5xl">🔌</div>
            <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                Dados reais da API Perenual
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                O catálogo é alimentado pela{" "}
                <a
                    href="https://perenual.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "var(--color-flora-green-600)" }}>
                    API pública Perenual
                </a>
                , que fornece informações botânicas de milhares de espécies. Os arranjos e favoritos ficam salvos no banco de dados local da aplicação.
                </p>
            </div>
            </div>
        </section>
        </div>
    );
}