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
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#666161", borderRightColor: "#AF9AC9", animation: "spin 0.9s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p className="font-label text-sm uppercase tracking-widest" style={{ color: "#A5937B" }}>{label}</p>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClearFilters }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center rounded-xl"
             style={{ border: "1.5px dashed rgba(165,147,123,0.35)", background: "#ffffff" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(175,154,201,0.16)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#666161" style={{ opacity: 0.45 }}>
                    <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                </svg>
            </div>
            <div>
                <p className="font-headline font-extrabold text-xl tracking-tight mb-1" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>
                    {hasFilters ? "No trips match your filters" : "No open trips right now"}
                </p>
                <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: "#666161" }}>
                    {hasFilters
                        ? "Try adjusting your search to find more travel opportunities."
                        : "New trips are posted daily. Check back soon or start your own."}
                </p>
            </div>
            {hasFilters && (
                <button onClick={onClearFilters}
                        className="font-label font-bold text-sm uppercase tracking-wider"
                        style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#AF9AC9", background: "none", border: "none", cursor: "pointer" }}>
                    Clear filters
                </button>
            )}
        </div>
    );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-xl"
             style={{ border: "1.5px dashed rgba(165,147,123,0.35)", background: "#ffffff" }}>
            <p className="font-body text-sm" style={{ color: "#666161" }}>{message}</p>
            <button onClick={onRetry}
                    className="font-label font-bold uppercase px-5 py-2.5 rounded-xl transition-opacity active:scale-95"
                    style={{ fontSize: "11px", letterSpacing: "0.12em", background: "linear-gradient(180deg, #767070 0%, #666161 100%)", color: "#E9E3DE", border: "none", boxShadow: "0 3px 0 #3a3737", cursor: "pointer" }}>
                Try again
            </button>
        </div>
    );
}

// ─── Join Request Panel ───────────────────────────────────────────────────────

function JoinRequestPanel({ trip, onClose, onSuccess }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) { setError("Please write a short message to the trip organizer."); return; }
        setLoading(true); setError(null);
        try {
            await requestToJoinTrip(trip.tripId, { message: message.trim() });
            setSent(true);
            setTimeout(() => { onSuccess?.(trip.tripId); onClose?.(); }, 1800);
        } catch (err) {
            setError(err.message ?? "Failed to send request. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 px-6 md:px-7 py-5" style={{ borderTop: "1px solid rgba(165,147,123,0.25)", background: "#faf8f6" }}>
            {sent ? (
                <div className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(175,154,201,0.18)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AF9AC9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-label font-bold" style={{ fontSize: "12px", letterSpacing: "0.06em", color: "#3a2d4a" }}>Request sent</p>
                        <p className="font-body text-xs" style={{ color: "#666161" }}>The organizer will review your request.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div>
                        <label className="font-label uppercase block mb-2" style={{ fontSize: "9px", letterSpacing: "0.14em", fontWeight: 600, color: "#A5937B" }}>
                            Your message to {trip.ownerFullName || "the organizer"}
                        </label>
                        <textarea value={message} onChange={(e) => { setMessage(e.target.value); setError(null); }}
                                  placeholder="Tell them why you'd be a great travel companion for this trip..."
                                  rows={3} maxLength={500}
                                  style={{ width: "100%", padding: "10px 12px", fontSize: "14px", background: "#ffffff", border: `1.5px solid ${error ? "#ba1a1a" : "rgba(165,147,123,0.28)"}`, borderRadius: "10px", color: "#3a3737", resize: "none", outline: "none", lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                                  onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                                  onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "#ba1a1a" : "rgba(165,147,123,0.28)"; e.currentTarget.style.boxShadow = "none"; }} />
                        <div className="flex justify-between items-center mt-1">
                            {error ? <p className="font-label" style={{ fontSize: "11px", color: "#ba1a1a" }}>{error}</p> : <span />}
                            <span className="font-label" style={{ fontSize: "10px", color: "#A5937B" }}>{message.length} / 500</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSubmit} disabled={loading}
                                className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-60"
                                style={{ fontSize: "11px", letterSpacing: "0.12em", background: "linear-gradient(180deg, #767070 0%, #666161 50%, #524f4f 100%)", color: "#E9E3DE", padding: "10px 20px", borderRadius: "999px", border: "none", boxShadow: "0 4px 0 #3a3737", cursor: "pointer" }}>
                            {loading ? <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#E9E3DE", animation: "spin 0.8s linear infinite" }} />Sending...</> : "Send Request"}
                        </button>
                        <button onClick={onClose} disabled={loading}
                                className="font-label font-semibold transition-colors disabled:opacity-50"
                                style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#A5937B", background: "none", border: "none", cursor: "pointer" }}>
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
        <button onClick={onClick}
                className="flex-shrink-0 font-label font-semibold uppercase transition-all active:scale-95"
                style={{
                    fontSize: "10px", letterSpacing: "0.12em", padding: "6px 14px", borderRadius: "999px", cursor: "pointer",
                    background: active ? "linear-gradient(180deg, #767070 0%, #666161 100%)" : "#ffffff",
                    color: active ? "#E9E3DE" : "#666161",
                    border: `1px solid ${active ? "transparent" : "rgba(165,147,123,0.30)"}`,
                    boxShadow: active ? "0 2px 0 #3a3737" : "none",
                }}>
            {label}
        </button>
    );
}

// ─── OpenTripsPage ────────────────────────────────────────────────────────────

export default function OpenTripsPage({ onNavigate }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedBudget, setSelectedBudget] = useState("");
    const [openJoinPanelId, setOpenJoinPanelId] = useState(null);
    const [requestedTripIds, setRequestedTripIds] = useState(new Set());

    const fetchTrips = useCallback(async () => {
        setLoading(true); setError(null);
        try { const data = await getJoinableTrips(); setTrips(Array.isArray(data) ? data : []); }
        catch (err) { setError(err.message ?? "Failed to load trips"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    const filtered = trips.filter((trip) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || trip.destinationCity?.toLowerCase().includes(query) || trip.destinationCountry?.toLowerCase().includes(query) || trip.title?.toLowerCase().includes(query);
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

    return (
        <div className="space-y-8">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <section className="relative rounded-xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(165,147,123,0.25)", boxShadow: "0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)" }}>
                <div className="h-24 md:h-32 w-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #666161 0%, #575353 40%, #4d4949 100%)" }}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(58,55,55,0.55) 100%)" }} />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none" style={{ opacity: 0.06 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 24 24" fill="#E9E3DE">
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                        </svg>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #666161, #A5937B, #AF9AC9)" }} />
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-8 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    <div className="w-14 h-14 rounded-xl border-4 flex items-center justify-center flex-shrink-0"
                         style={{ background: "linear-gradient(135deg, #666161 0%, #4d4949 100%)", borderColor: "#E9E3DE", boxShadow: "0 4px 0 #bfb9b4, 0 6px 16px rgba(58,55,55,0.18)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#E9E3DE">
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                        </svg>
                    </div>
                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl tracking-tight" style={{ color: "#3a3737", fontFamily: "'DM Serif Display', serif" }}>Open Trips</h1>
                        <p className="font-label text-sm mt-0.5 uppercase tracking-wider" style={{ color: "#A5937B" }}>
                            {loading ? "Finding departures..." : `${trips.length} departure${trips.length !== 1 ? "s" : ""} available`}
                        </p>
                    </div>
                    <button onClick={() => onNavigate?.("my-trips")}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase self-end md:self-auto transition-all active:scale-95 flex-shrink-0"
                            style={{ fontSize: "10px", letterSpacing: "0.12em", background: "transparent", color: "#666161", border: "1.5px solid rgba(165,147,123,0.35)", padding: "8px 16px", borderRadius: "999px", cursor: "pointer" }}>
                        My Trips
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* ── Filter bar ────────────────────────────────────────────────── */}
            <div className="rounded-xl px-5 py-4 flex flex-col md:flex-row gap-4 md:items-center"
                 style={{ background: "#ffffff", boxShadow: "0 2px 0 #d4cec9", border: "1px solid rgba(165,147,123,0.25)" }}>
                <div className="relative flex-1 min-w-0">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#A5937B" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Search destinations..."
                           style={{ width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "10px", paddingBottom: "10px", borderRadius: "10px", border: "1.5px solid rgba(165,147,123,0.28)", background: "#faf8f6", color: "#3a3737", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                           onFocus={(e) => { e.currentTarget.style.borderColor = "#AF9AC9"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(175,154,201,0.18)"; }}
                           onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(165,147,123,0.28)"; e.currentTarget.style.boxShadow = "none"; }} />
                </div>
                <div className="flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto pb-0.5 md:pb-0" style={{ scrollbarWidth: "none" }}>
                    {TRIP_TYPE_OPTIONS.slice(0, 5).map((opt) => (
                        <FilterPill key={opt.value} label={opt.label} active={selectedType === opt.value} onClick={() => setSelectedType(selectedType === opt.value ? "" : opt.value)} />
                    ))}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {BUDGET_OPTIONS.slice(1).map((opt) => (
                        <FilterPill key={opt.value} label={opt.label} active={selectedBudget === opt.value} onClick={() => setSelectedBudget(selectedBudget === opt.value ? "" : opt.value)} />
                    ))}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            {loading && <Spinner label="Finding departures..." />}
            {!loading && error && <ErrorState message={error} onRetry={fetchTrips} />}
            {!loading && !error && filtered.length === 0 && (
                <EmptyState hasFilters={hasFilters} onClearFilters={() => { setSearchQuery(""); setSelectedType(""); setSelectedBudget(""); }} />
            )}
            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map((trip) => {
                        const alreadyRequested = requestedTripIds.has(trip.tripId);
                        const panelOpen = openJoinPanelId === trip.tripId;
                        return (
                            <div key={trip.tripId} className="flex flex-col rounded-xl overflow-hidden"
                                 style={{ boxShadow: panelOpen ? "0 8px 32px rgba(58,55,55,0.12)" : "none", transition: "box-shadow 0.2s ease" }}>
                                <TripTicketCard
                                    trip={trip}
                                    variant={alreadyRequested ? "joined" : "explore"}
                                    onRequestBoardingClick={handleRequestBoarding}
                                />
                                {panelOpen && (
                                    <JoinRequestPanel trip={trip} onClose={() => setOpenJoinPanelId(null)} onSuccess={handleJoinSuccess} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Footer CTA ────────────────────────────────────────────────── */}
            {!loading && !error && (
                <div className="text-center pt-4 pb-8">
                    <p className="font-label text-xs uppercase tracking-widest mb-3" style={{ letterSpacing: "0.14em", color: "#A5937B" }}>Want to lead your own trip?</p>
                    <button onClick={() => onNavigate?.("my-trips")}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                            style={{ fontSize: "11px", letterSpacing: "0.12em", background: "transparent", color: "#666161", border: "1.5px solid rgba(165,147,123,0.35)", padding: "10px 22px", borderRadius: "999px", cursor: "pointer" }}>
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