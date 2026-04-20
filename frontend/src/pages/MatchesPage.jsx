import { useState, useEffect, useCallback } from "react";
import { getMyMatches, deleteMatch } from "../services/matchesApi";

// ─── Enum display maps (mirrors MyProfilePage + FeedPage conventions) ─────────
const SOCIAL_BATTERY = {
    INTROVERT:        { label: "Introvert",   icon: "🧘" },
    AMBIVERT:         { label: "Ambivert",    icon: "🤝" },
    EXTROVERT:        { label: "Extrovert",   icon: "🎉" },
};
const PLANNING_STYLE = {
    SPONTANEOUS:      { label: "Spontaneous", icon: "⚡" },
    FLEXIBLE:         { label: "Flexible",    icon: "🗺️" },
    STRICT_ITINERARY: { label: "Planner",     icon: "📋" },
};
const BUDGET = {
    BUDGET_FRIENDLY:  { label: "Budget",   icon: "🪙" },
    MODERATE:         { label: "Moderate", icon: "💳" },
    LUXURY:           { label: "Luxury",   icon: "💎" },
};

// ─── Date formatter ────────────────────────────────────────────────────────────
function formatMatchedAt(isoString) {
    if (!isoString) return "—";
    try {
        const d = new Date(isoString);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7)  return `${diffDays} days ago`;
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return isoString;
    }
}

// ─── Initials fallback ─────────────────────────────────────────────────────────
function getInitials(fullName = "") {
    return fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}

// ─── Loading spinner — exact same pattern as App.jsx / MyProfilePage ──────────
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

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNavigate }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
            {/* Decorative plane */}
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-secondary-fixed opacity-40" />
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-secondary relative z-10">
                    <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                </svg>
            </div>
            <div>
                <h2 className="font-headline font-extrabold text-xl text-primary tracking-tight mb-2">
                    No connections yet
                </h2>
                <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
                    Matches appear when two travelers both show interest in each other.
                    Head to the feed and start discovering.
                </p>
            </div>
            <button
                onClick={() => onNavigate?.("feed")}
                className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-6 py-2.5 rounded-xl font-headline font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
            >
                Discover Travelers
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
            </button>
            <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                Your travel companions are waiting
            </p>
        </div>
    );
}

// ─── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-8 text-center border border-dashed" style={{ borderColor: "#ffdad6" }}>
            <p className="font-body text-sm text-on-surface-variant mb-4">{message}</p>
            <button
                onClick={onRetry}
                className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-5 py-2.5 rounded-xl font-headline font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
                Try again
            </button>
        </div>
    );
}

// ─── Confirm dialog (inline elegant, no browser confirm()) ────────────────────
function UnmatchConfirm({ name, onConfirm, onCancel, loading }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
            {/* Dialog */}
            <div className="relative z-10 bg-surface-container-lowest rounded-xl p-6 mx-6 shadow-2xl text-center max-w-xs w-full">
                {/* Dashed separator accent */}
                <div className="w-8 h-1 bg-tertiary-fixed-dim rounded-full mx-auto mb-4 opacity-60" />
                <p className="font-headline font-bold text-primary text-base mb-1">
                    Remove match?
                </p>
                <p className="font-body text-sm text-on-surface-variant mb-5 leading-relaxed">
                    You'll no longer be connected with <strong className="text-primary">{name}</strong>.
                    This can't be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl font-headline font-bold text-sm text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all disabled:opacity-50"
                    >
                        Keep
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-xl font-headline font-bold text-sm text-on-error bg-error hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Removing...
                            </>
                        ) : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── DNA pill ─────────────────────────────────────────────────────────────────
function DnaPill({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label font-semibold text-xs bg-secondary-fixed text-on-secondary-fixed">
            <span>{icon}</span>{label}
        </span>
    );
}

// ─── Context badge chip ────────────────────────────────────────────────────────
function ContextBadge({ label }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label font-medium text-xs bg-surface-container text-on-surface-variant border border-outline-variant">
            {label}
        </span>
    );
}

// ─── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match, onUnmatch }) {
    const [confirming,   setConfirming]   = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError,  setDeleteError]  = useState(null);

    const {
        matchId,
        fullName        = "",
        age,
        currentLocation,
        originCountry,
        profilePictureUrl,
        bio,
        socialBattery,
        planningStyle,
        budget,
        compatibilityScore,
        superLikeInvolved,
        matchedAt,
        contextBadges   = [],
        whyYouMatched,
    } = match;

    const inits   = getInitials(fullName);
    const hasImg  = !!profilePictureUrl;
    const scoreColor =
        compatibilityScore >= 80 ? "#0c6780"   : // secondary — high
            compatibilityScore >= 60 ? "#d97706"   : // amber — medium
                "#737780";    // outline — low

    const handleConfirmDelete = async () => {
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            await deleteMatch(matchId);
            onUnmatch(matchId);
        } catch (err) {
            setDeleteError(err.message ?? "Failed to remove match");
            setDeleteLoading(false);
            setConfirming(false);
        }
    };

    return (
        <article className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_24px_48px_rgba(0,29,69,0.06)] flex flex-col md:flex-row">

            {/* Confirm overlay */}
            {confirming && (
                <UnmatchConfirm
                    name={fullName}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setConfirming(false); setDeleteError(null); }}
                    loading={deleteLoading}
                />
            )}

            {/* ── Left: photo + score ─────────────────────────────────────── */}
            <div className="relative flex-shrink-0 w-full md:w-44 h-52 md:h-auto overflow-hidden bg-primary">
                {hasImg ? (
                    <img
                        src={profilePictureUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display = "flex";
                        }}
                    />
                ) : null}
                {/* Initials fallback */}
                <div
                    className="w-full h-full items-center justify-center bg-primary"
                    style={{ display: hasImg ? "none" : "flex" }}
                >
                    <span
                        className="font-headline font-extrabold text-on-primary select-none"
                        style={{ fontSize: "2.8rem", opacity: 0.18, letterSpacing: "0.1em" }}
                    >
                        {inits}
                    </span>
                </div>

                {/* Gradient overlay for mobile readability */}
                <div className="absolute inset-0 pointer-events-none md:hidden"
                     style={{ background: "linear-gradient(to top, rgba(0,29,69,0.55) 0%, transparent 60%)" }}
                />

                {/* Compatibility score badge */}
                <div
                    className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full font-label font-bold text-xs"
                    style={{
                        background:    "rgba(255,255,255,0.92)",
                        backdropFilter:"blur(8px)",
                        color:         scoreColor,
                        border:        `1.5px solid ${scoreColor}30`,
                    }}
                >
                    ✦ {compatibilityScore}%
                </div>

                {/* Super like badge */}
                {superLikeInvolved && (
                    <div
                        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full font-label font-bold text-xs"
                        style={{
                            background: "rgba(0,29,69,0.72)",
                            backdropFilter: "blur(8px)",
                            color: "#ffb77d",
                            border: "1px solid rgba(255,183,125,0.50)",
                        }}
                    >
                        ★ Super
                    </div>
                )}
            </div>

            {/* ── Center: content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col p-5 md:p-6 gap-3 min-w-0">

                {/* Name + location */}
                <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-headline font-extrabold text-xl text-primary leading-tight tracking-tight">
                            {fullName}
                        </span>
                        {age != null && (
                            <span className="font-body text-base text-on-surface-variant">{age}</span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5">
                        {currentLocation && (
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-secondary flex-shrink-0">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span className="font-label text-xs uppercase tracking-wider">{currentLocation}</span>
                            </div>
                        )}
                        {originCountry && (
                            <div className="flex items-center gap-1 text-on-surface-variant">
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-outline flex-shrink-0">
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                                <span className="font-label text-xs uppercase tracking-wider">{originCountry}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {bio && (
                    <p
                        className="font-body text-sm text-on-surface-variant leading-relaxed italic"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        "{bio}"
                    </p>
                )}

                {/* Travel DNA */}
                {(socialBattery || planningStyle || budget) && (
                    <div>
                        <p className="font-label text-[9px] uppercase tracking-widest text-outline mb-1.5">Travel DNA</p>
                        <div className="flex flex-wrap gap-1.5">
                            {socialBattery && SOCIAL_BATTERY[socialBattery] && (
                                <DnaPill {...SOCIAL_BATTERY[socialBattery]} />
                            )}
                            {planningStyle && PLANNING_STYLE[planningStyle] && (
                                <DnaPill {...PLANNING_STYLE[planningStyle]} />
                            )}
                            {budget && BUDGET[budget] && (
                                <DnaPill {...BUDGET[budget]} />
                            )}
                        </div>
                    </div>
                )}

                {/* Why you matched */}
                {whyYouMatched && (
                    <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                            {whyYouMatched}
                        </p>
                    </div>
                )}

                {/* Context badges */}
                {contextBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {contextBadges.map((badge) => (
                            <ContextBadge key={badge} label={badge} />
                        ))}
                    </div>
                )}

                {/* Delete error inline */}
                {deleteError && (
                    <p className="font-label text-xs text-error">{deleteError}</p>
                )}
            </div>

            {/* ── Right stub: boarding pass style ─────────────────────────── */}
            <div className="hidden md:flex flex-col items-center justify-between flex-shrink-0 w-20 border-l border-dashed border-outline-variant py-5 px-3 relative">
                {/* Notch circles on the dashed border */}
                <div className="absolute -left-2.5 top-6  w-5 h-5 rounded-full bg-surface" />
                <div className="absolute -left-2.5 bottom-6 w-5 h-5 rounded-full bg-surface" />

                {/* Barcode accent — same as MyProfilePage personal info card */}
                <div className="flex gap-0.5 opacity-20 mb-3">
                    {[0.5, 1, 0.5, 2, 0.5, 1.5, 0.5, 1].map((w, i) => (
                        <div key={i} className="bg-primary" style={{ width: `${w * 3}px`, height: "32px" }} />
                    ))}
                </div>

                {/* Matched date — vertical label */}
                <div className="flex flex-col items-center gap-1 flex-1 justify-center">
                    <p className="font-label text-[8px] uppercase tracking-widest text-outline">Matched</p>
                    <p
                        className="font-label font-bold text-[10px] text-on-surface-variant text-center leading-snug"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "80px" }}
                    >
                        {formatMatchedAt(matchedAt)}
                    </p>
                </div>

                {/* Unmatch button */}
                <button
                    onClick={() => setConfirming(true)}
                    className="mt-3 p-2 rounded-lg text-outline hover:text-error hover:bg-error-container transition-all"
                    title="Remove match"
                    aria-label={`Remove match with ${fullName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
            </div>

            {/* Mobile: matched date + unmatch button in footer bar */}
            <div className="md:hidden flex items-center justify-between border-t border-dashed border-outline-variant px-5 py-3">
                <div className="flex items-center gap-1.5 text-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                    </svg>
                    <span className="font-label text-[10px] uppercase tracking-wider">
                        {formatMatchedAt(matchedAt)}
                    </span>
                </div>
                <button
                    onClick={() => setConfirming(true)}
                    className="flex items-center gap-1.5 font-label text-xs text-outline hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error-container"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Remove
                </button>
            </div>
        </article>
    );
}

// ─── MatchesPage ───────────────────────────────────────────────────────────────
// Rendered by App.jsx inside <main className="mt-24 md:mt-28 mb-12 flex-grow max-w-7xl mx-auto ...">
// No own nav or full-page wrapper needed.
export default function MatchesPage({ onNavigate }) {
    const [matches,  setMatches]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);

    const fetchMatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyMatches();
            setMatches(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message ?? "Failed to load matches");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    // Optimistic removal — remove from local state immediately after confirmed delete
    const handleUnmatch = useCallback((matchId) => {
        setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
    }, []);

    // ── Render ──────────────────────────────────────────────────────────────
    if (loading) return <Spinner label="Loading your matches..." />;

    return (
        <div className="space-y-8">

            {/* ── Page header ─────────────────────────────────────────────── */}
            <section className="relative bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] overflow-hidden">
                {/* Cover strip — matches MyProfilePage hero pattern */}
                <div className="h-28 md:h-36 w-full bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                    {/* Decorative plane */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
                        <div className="absolute top-2 right-10 text-white text-[100px] font-headline font-extrabold leading-none">✈</div>
                    </div>
                </div>

                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-10 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    {/* Icon badge */}
                    <div className="w-16 h-16 rounded-xl border-4 border-surface-container-lowest shadow-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-on-secondary">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>

                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                            Your Matches
                        </h1>
                        <p className="font-label text-sm text-on-surface-variant mt-0.5 uppercase tracking-wider">
                            {matches.length > 0
                                ? `${matches.length} mutual connection${matches.length !== 1 ? "s" : ""}`
                                : "Mutual connections based on Travel DNA"}
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Error state ─────────────────────────────────────────────── */}
            {error && <ErrorState message={error} onRetry={fetchMatches} />}

            {/* ── Empty state ─────────────────────────────────────────────── */}
            {!error && matches.length === 0 && (
                <EmptyState onNavigate={onNavigate} />
            )}

            {/* ── Match list ──────────────────────────────────────────────── */}
            {!error && matches.length > 0 && (
                <div className="space-y-5">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.matchId}
                            match={match}
                            onUnmatch={handleUnmatch}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}