export default function Footer() {
    return (
        <footer className="bg-surface w-full py-8 mt-auto border-t border-surface-container">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
                <div className="font-label text-xs uppercase tracking-widest text-outline mb-4 md:mb-0">
                    © 2025 Travel Buddy. Your Global Concierge.
                </div>
                <div className="flex space-x-8">
                    {["Privacy Policy", "Terms of Service", "Help Center"].map((t) => (
                        <span
                            key={t}
                            className="font-label text-xs uppercase tracking-widest text-outline opacity-80 cursor-default"
                        >
              {t}
            </span>
                    ))}
                </div>
            </div>
        </footer>
    );
}