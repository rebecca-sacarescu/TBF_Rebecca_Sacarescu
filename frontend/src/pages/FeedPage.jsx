export default function FeedPage() {
    return (
        <div className="space-y-8">
            {/* Hero */}
            <section className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] p-8 md:p-12 text-center">
                <div className="text-5xl mb-4"></div>
                <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-2">
                    Discover Travelers
                </h1>
                <p className="text-on-surface-variant font-body max-w-lg mx-auto">
                    Browse profiles of fellow travelers who share your vibe. This section will show matched Travel DNA profiles once the feed endpoint is ready.
                </p>
                <div className="mt-8 flex justify-center">
          <span className="bg-secondary-fixed text-on-secondary-fixed text-xs font-label font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Coming Soon — GET /feed
          </span>
                </div>
            </section>

            {/* Placeholder cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary-fixed/30" />
                        <div className="p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-container" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 bg-surface-container rounded w-2/3" />
                                    <div className="h-2 bg-surface-container rounded w-1/3" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-6 bg-surface-container rounded-full w-16" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}