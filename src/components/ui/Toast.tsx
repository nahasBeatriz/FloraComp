export default function Toast({ message }: { message: string | null }) {
    if (!message) return null;

    return (
        <div
        role="status"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50"
        style={{ background: "var(--text-primary)", color: "var(--bg-card)" }}>
        {message}
        </div>
    );
}
