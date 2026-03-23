export default function MatchesPage() {
    return (
        <div className="space-y-8">
            <section className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] p-8 md:p-12 text-center">
                <div className="text-5xl mb-4">✈</div>
                <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-2">
                    Your Matches
                </h1>
                <p className="text-on-surface-variant font-body max-w-lg mx-auto">
                    See who you've connected with based on your Travel DNA compatibility. Matches will appear here once the matching algorithm is implemented.
                </p>
                <div className="mt-8 flex justify-center">
          <span className="bg-tertiary-fixed text-on-tertiary-fixed text-xs font-label font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Coming Soon — Matching System
          </span>
                </div>
            </section>

            {/* Empty state illustration */}
            <div className="flex justify-center py-8">
                <div className="text-center space-y-4">
                    <div className="flex justify-center gap-4 opacity-30">
                    </div>
                    <p className="font-label text-xs uppercase tracking-widest text-outline">
                        Your travel companions are waiting
                    </p>
                </div>
            </div>
        </div>
    );
}