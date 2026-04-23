import { useState, useEffect, useCallback } from "react";
import { getJoinableTrips, requestToJoinTrip } from "../services/tripsApi";
import TripTicketCard from "../components/TripTicketCard";

// ─── Enum maps ────────────────────────────────────────────────────────────────

const TRIP_TYPE_OPTIONS = [
    { value: "", label: "All Types" },
    { value: "CITY_BREAK", label: "City Break" },
    { value: "ROAD_TRIP", label: "Road Trip" },
    { value: "BEACH_ESCAPE", label: "Beach Escape" },
    { value: "HIKING_NATURE", label: "Hiking" },
    { value: "CULTURE_FOOD", label: "Culture & Food" },
    { value: "BACKPACKING", label: "Backpacking" },
];

const BUDGET_OPTIONS = [
    { value: "", label: "Any Budget" },
    { value: "BUDGET_FRIENDLY", label: "Budget" },
    { value: "MODERATE", label: "Moderate" },
    { value: "LUXURY", label: "Luxury" },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-label text-sm text-outline uppercase tracking-widest">{label}</p>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClearFilters }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-6 py-24 text-center rounded-xl"
            style={{ border: "1.5px dashed #c3c6d1", background: "#fff" }}
        >
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,29,69,0.05)" }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-primary" style={{ opacity: 0.4 }}>
                    <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                </svg>
            </div>
            <div>
                <p className="font-headline font-extrabold text-xl text-primary tracking-tight mb-1">
                    {hasFilters ? "No trips match your filters" : "No open trips right now"}
                </p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
                    {hasFilters
                        ? "Try adjusting your search to find more travel opportunities."
                        : "New trips are posted daily. Check back soon or start your own."}
                </p>
            </div>
            {hasFilters && (
                <button
                    onClick={onClearFilters}
                    className="font-label font-bold text-secondary text-sm uppercase tracking-wider hover:underline"
                    style={{ fontSize: "11px", letterSpacing: "0.12em" }}
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-xl"
            style={{ border: "1.5px dashed #ffdad6", background: "#fff" }}
        >
            <p className="font-body text-sm text-on-surface-variant">{message}</p>
            <button
                onClick={onRetry}
                className="font-label font-bold uppercase px-5 py-2.5 rounded-xl text-on-secondary bg-secondary hover:opacity-90 transition-opacity active:scale-95"
                style={{ fontSize: "11px", letterSpacing: "0.12em" }}
            >
                Try again
            </button>
        </div>
    );
}

// ─── Join Request Panel ───────────────────────────────────────────────────────
// Inline panel — slides open below the card (not a modal).

function JoinRequestPanel({ trip, onClose, onSuccess }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            setError("Please write a short message to the trip organizer.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await requestToJoinTrip(trip.tripId, { message: message.trim() });
            setSent(true);
            setTimeout(() => {
                onSuccess?.(trip.tripId);
                onClose?.();
            }, 1800);
        } catch (err) {
            setError(err.message ?? "Failed to send request. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div
            className="border-t border-outline-variant bg-surface-container-low px-6 md:px-7 py-5 flex flex-col gap-4"
            style={{ borderTop: "1px solid rgba(0,29,69,0.08)" }}
        >
            {sent ? (
                <div className="flex items-center gap-3 py-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(12,103,128,0.12)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c6780" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-label font-bold text-secondary" style={{ fontSize: "12px", letterSpacing: "0.06em" }}>
                            Request sent
                        </p>
                        <p className="font-body text-xs text-on-surface-variant">
                            The organizer will review your request.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <label
                            className="font-label uppercase text-outline block mb-2"
                            style={{ fontSize: "9px", letterSpacing: "0.14em", fontWeight: 600 }}
                        >
                            Your message to {trip.ownerFullName || "the organizer"}
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => { setMessage(e.target.value); setError(null); }}
                            placeholder="Tell them why you'd be a great travel companion for this trip..."
                            rows={3}
                            maxLength={500}
                            className="w-full rounded-lg border font-body text-sm text-on-surface bg-surface-container-lowest resize-none focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all placeholder:text-outline"
                            style={{
                                borderColor: error ? "#ba1a1a" : "rgba(0,29,69,0.12)",
                                padding: "10px 12px",
                                fontSize: "14px",
                                lineHeight: "1.6",
                            }}
                        />
                        <div className="flex justify-between items-center mt-1">
                            {error ? (
                                <p className="font-label text-error" style={{ fontSize: "11px" }}>{error}</p>
                            ) : (
                                <span />
                            )}
                            <span className="font-label text-outline" style={{ fontSize: "10px" }}>
                                {message.length} / 500
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-60"
                            style={{
                                fontSize: "11px",
                                letterSpacing: "0.12em",
                                background: "#001d45",
                                color: "#ffffff",
                                padding: "10px 20px",
                                borderRadius: "999px",
                                boxShadow: "0 4px 16px rgba(0,29,69,0.20)",
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </>
                            ) : "Send Request"}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="font-label font-semibold text-outline hover:text-on-surface transition-colors disabled:opacity-50"
                            style={{ fontSize: "11px", letterSpacing: "0.08em" }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 font-label font-semibold uppercase transition-all active:scale-95"
            style={{
                fontSize: "10px",
                letterSpacing: "0.12em",
                padding: "6px 14px",
                borderRadius: "999px",
                background: active ? "#001d45" : "#ffffff",
                color: active ? "#ffffff" : "#737780",
                border: `1px solid ${active ? "#001d45" : "#c3c6d1"}`,
                boxShadow: active ? "0 2px 8px rgba(0,29,69,0.16)" : "none",
            }}
        >
            {label}
        </button>
    );
}

// ─── OpenTripsPage ────────────────────────────────────────────────────────────

export default function OpenTripsPage({ onNavigate }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedBudget, setSelectedBudget] = useState("");

    // Join panel — stores the tripId that has the panel open
    const [openJoinPanelId, setOpenJoinPanelId] = useState(null);
    // Tracks tripIds for which a request has been sent (local state)
    const [requestedTripIds, setRequestedTripIds] = useState(new Set());

    const fetchTrips = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJoinableTrips();
            setTrips(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message ?? "Failed to load trips");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    // ── Client-side filter ────────────────────────────────────────────────────
    const filtered = trips.filter((trip) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            !query ||
            trip.destinationCity?.toLowerCase().includes(query) ||
            trip.destinationCountry?.toLowerCase().includes(query) ||
            trip.title?.toLowerCase().includes(query);
        const matchesType = !selectedType || trip.tripType === selectedType;
        const matchesBudget = !selectedBudget || trip.budget === selectedBudget;
        return matchesSearch && matchesType && matchesBudget;
    });

    const hasFilters = !!searchQuery || !!selectedType || !!selectedBudget;

    const handleRequestBoarding = (trip) => {
        if (requestedTripIds.has(trip.tripId)) return;
        setOpenJoinPanelId((prev) => (prev === trip.tripId ? null : trip.tripId));
    };

    const handleJoinSuccess = (tripId) => {
        setRequestedTripIds((prev) => new Set([...prev, tripId]));
        setOpenJoinPanelId(null);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">

            {/* ── Page header ───────────────────────────────────────────────── */}
            <section className="relative bg-surface-container-lowest rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,29,69,0.05)" }}>
                {/* Cover strip */}
                <div className="h-24 md:h-32 w-full bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90" />
                    {/* Decorative plane motif */}
                    <div
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white pointer-events-none select-none"
                        style={{ fontSize: "80px", opacity: 0.04, fontFamily: "inherit" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="white">
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                        </svg>
                    </div>
                    {/* Accent line */}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent opacity-60" />
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-8 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    <div
                        className="w-14 h-14 rounded-xl border-4 flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "#001d45",
                            borderColor: "#fff",
                            boxShadow: "0 8px 24px rgba(0,29,69,0.22)",
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                            Open Trips
                        </h1>
                        <p className="font-label text-sm text-on-surface-variant mt-0.5 uppercase tracking-wider">
                            {loading ? "Finding departures..." : `${trips.length} departure${trips.length !== 1 ? "s" : ""} available`}
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate?.("my-trips")}
                        className="inline-flex items-center gap-2 font-label font-bold uppercase self-end md:self-auto transition-all active:scale-95 flex-shrink-0"
                        style={{
                            fontSize: "10px",
                            letterSpacing: "0.12em",
                            background: "transparent",
                            color: "#001d45",
                            border: "1.5px solid rgba(0,29,69,0.20)",
                            padding: "8px 16px",
                            borderRadius: "999px",
                        }}
                    >
                        My Trips
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* ── Filter bar ────────────────────────────────────────────────── */}
            <div
                className="bg-surface-container-lowest rounded-xl px-5 py-4 flex flex-col md:flex-row gap-4 md:items-center"
                style={{
                    boxShadow: "0 2px 12px rgba(0,29,69,0.04)",
                    border: "1px solid rgba(0,29,69,0.06)",
                }}
            >
                {/* Search input */}
                <div className="relative flex-1 min-w-0">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search destinations..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border font-body text-sm text-on-surface bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder:text-outline"
                        style={{ borderColor: "rgba(0,29,69,0.10)", fontSize: "13px" }}
                    />
                </div>

                {/* Type pills */}
                <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-0.5 md:pb-0" style={{ scrollbarWidth: "none" }}>
                    {TRIP_TYPE_OPTIONS.slice(0, 5).map((opt) => (
                        <FilterPill
                            key={opt.value}
                            label={opt.label}
                            active={selectedType === opt.value}
                            onClick={() => setSelectedType(selectedType === opt.value ? "" : opt.value)}
                        />
                    ))}
                </div>

                {/* Budget pills */}
                <div className="flex gap-2 flex-shrink-0">
                    {BUDGET_OPTIONS.slice(1).map((opt) => (
                        <FilterPill
                            key={opt.value}
                            label={opt.label}
                            active={selectedBudget === opt.value}
                            onClick={() => setSelectedBudget(selectedBudget === opt.value ? "" : opt.value)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            {loading && <Spinner label="Finding departures..." />}

            {!loading && error && <ErrorState message={error} onRetry={fetchTrips} />}

            {!loading && !error && filtered.length === 0 && (
                <EmptyState
                    hasFilters={hasFilters}
                    onClearFilters={() => { setSearchQuery(""); setSelectedType(""); setSelectedBudget(""); }}
                />
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map((trip) => {
                        const alreadyRequested = requestedTripIds.has(trip.tripId);
                        const panelOpen = openJoinPanelId === trip.tripId;

                        return (
                            <div
                                key={trip.tripId}
                                className="flex flex-col rounded-xl overflow-hidden"
                                style={{
                                    boxShadow: panelOpen
                                        ? "0 8px 32px rgba(0,29,69,0.12)"
                                        : "none",
                                    transition: "box-shadow 0.2s ease",
                                }}
                            >
                                <TripTicketCard
                                    trip={trip}
                                    variant={alreadyRequested ? "joined" : "explore"}
                                    onRequestBoardingClick={handleRequestBoarding}
                                />
                                {panelOpen && (
                                    <JoinRequestPanel
                                        trip={trip}
                                        onClose={() => setOpenJoinPanelId(null)}
                                        onSuccess={handleJoinSuccess}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Footer CTA ────────────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="text-center pt-4 pb-8">
                    <p className="font-label text-xs text-outline uppercase tracking-widest mb-3" style={{ letterSpacing: "0.14em" }}>
                        Want to lead your own trip?
                    </p>
                    <button
                        onClick={() => onNavigate?.("my-trips")}
                        className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 hover:shadow-lg"
                        style={{
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            background: "transparent",
                            color: "#001d45",
                            border: "1.5px solid rgba(0,29,69,0.20)",
                            padding: "10px 22px",
                            borderRadius: "999px",
                        }}
                    >
                        Publish a Departure
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}