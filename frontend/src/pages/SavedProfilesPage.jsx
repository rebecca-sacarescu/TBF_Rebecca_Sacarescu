import { useState, useEffect, useCallback } from "react";
import { getSavedProfiles, unsaveProfile } from "../services/savedProfilesApi";
import { BookmarkIcon } from "../components/Icons";

// ─── Enum maps ────────────────────────────────────────────────────────────────
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

function getInitials(fullName = "") {
    return fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function formatSavedAt(isoString) {
    if (!isoString) return "—";
    try {
        const d    = new Date(isoString);
        const now  = new Date();
        const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7)  return `${days}d ago`;
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } catch { return isoString; }
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-label text-sm text-outline uppercase tracking-widest">Loading saved profiles...</p>
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

// ─── Remove confirm ───────────────────────────────────────────────────────────
function RemoveConfirm({ name, onConfirm, onCancel, loading }) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
            <div className="relative z-10 bg-surface-container-lowest rounded-xl p-6 mx-6 shadow-2xl text-center max-w-xs w-full">
                <div className="w-8 h-1 bg-tertiary-fixed-dim rounded-full mx-auto mb-4 opacity-60" />
                <p className="font-headline font-bold text-primary text-base mb-1">Remove from saved?</p>
                <p className="font-body text-sm text-on-surface-variant mb-5 leading-relaxed">
                    <strong className="text-primary">{name}</strong> will be removed from your saved list. They may still appear in your feed.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl font-headline font-bold text-sm text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all disabled:opacity-50">
                        Keep
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl font-headline font-bold text-sm text-on-error bg-error hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
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

// ─── Saved profile card ───────────────────────────────────────────────────────
function SavedCard({ profile, onRemove, onViewProfile }) {
    const [confirming,    setConfirming]    = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [removeError,   setRemoveError]   = useState(null);

    const {
        targetUserId, fullName = "", age, currentLocation, originCountry,
        profilePictureUrl, bio, socialBattery, planningStyle, budget,
        compatibilityScore, savedAt,
    } = profile;

    const inits      = getInitials(fullName);
    const hasImg     = !!profilePictureUrl;
    const showScore  = compatibilityScore != null && Number(compatibilityScore) > 0;
    const scoreColor = compatibilityScore >= 80 ? "#0c6780" : compatibilityScore >= 60 ? "#d97706" : "#737780";

    const handleConfirmRemove = async () => {
        setRemoveLoading(true);
        setRemoveError(null);
        try {
            await unsaveProfile(targetUserId);
            onRemove(targetUserId);
        } catch (err) {
            setRemoveError(err.message ?? "Failed to remove");
            setRemoveLoading(false);
            setConfirming(false);
        }
    };

    return (
        <article className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_24px_48px_rgba(0,29,69,0.06)] flex flex-col md:flex-row">
            {confirming && (
                <RemoveConfirm
                    name={fullName}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => { setConfirming(false); setRemoveError(null); }}
                    loading={removeLoading}
                />
            )}

            {/* Photo */}
            <div className="relative flex-shrink-0 w-full md:w-40 h-48 md:h-auto overflow-hidden bg-primary">
                {hasImg ? (
                    <img src={profilePictureUrl} alt={fullName} className="w-full h-full object-cover"
                         onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling.style.display = "flex"; }} />
                ) : null}
                <div className="w-full h-full items-center justify-center bg-primary"
                     style={{ display: hasImg ? "none" : "flex" }}>
                    <span className="font-headline font-extrabold text-on-primary select-none"
                          style={{ fontSize: "2.8rem", opacity: 0.18, letterSpacing: "0.1em" }}>{inits}</span>
                </div>
                <div className="absolute inset-0 pointer-events-none md:hidden"
                     style={{ background: "linear-gradient(to top, rgba(0,29,69,0.55) 0%, transparent 60%)" }} />

                {/* Score badge */}
                {showScore && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full font-label font-bold text-xs"
                         style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", color: scoreColor, border: `1.5px solid ${scoreColor}30` }}>
                        ✦ {compatibilityScore}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-5 md:p-6 gap-3 min-w-0">
                <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-headline font-extrabold text-xl text-primary leading-tight tracking-tight">{fullName}</span>
                        {age != null && <span className="font-body text-base text-on-surface-variant">{age}</span>}
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

                {bio && (
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed italic"
                       style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        "{bio}"
                    </p>
                )}

                {(socialBattery || planningStyle || budget) && (
                    <div>
                        <p className="font-label text-[9px] uppercase tracking-widest text-outline mb-1.5">Travel DNA</p>
                        <div className="flex flex-wrap gap-1.5">
                            {socialBattery && SOCIAL_BATTERY[socialBattery] && <DnaPill {...SOCIAL_BATTERY[socialBattery]} />}
                            {planningStyle && PLANNING_STYLE[planningStyle] && <DnaPill {...PLANNING_STYLE[planningStyle]} />}
                            {budget && BUDGET[budget] && <DnaPill {...BUDGET[budget]} />}
                        </div>
                    </div>
                )}

                {removeError && <p className="font-label text-xs text-error">{removeError}</p>}
            </div>

            {/* Right stub — boarding pass style */}
            <div className="hidden md:flex flex-col items-center justify-between flex-shrink-0 w-20 border-l border-dashed border-outline-variant py-5 px-3 relative">
                <div className="absolute -left-2.5 top-6   w-5 h-5 rounded-full bg-surface" />
                <div className="absolute -left-2.5 bottom-6 w-5 h-5 rounded-full bg-surface" />

                {/* Barcode accent */}
                <div className="flex gap-0.5 opacity-20 mb-3">
                    {[0.5, 1, 0.5, 2, 0.5, 1.5, 0.5, 1].map((w, i) => (
                        <div key={i} className="bg-primary" style={{ width: `${w * 3}px`, height: "32px" }} />
                    ))}
                </div>

                {/* Saved date */}
                <div className="flex flex-col items-center gap-1 flex-1 justify-center">
                    <p className="font-label text-[8px] uppercase tracking-widest text-outline">Saved</p>
                    <p className="font-label font-bold text-[10px] text-on-surface-variant text-center leading-snug"
                       style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "80px" }}>
                        {formatSavedAt(savedAt)}
                    </p>
                </div>

                {/* View profile button */}
                <button
                    onClick={() => onViewProfile(targetUserId)}
                    className="mt-2 p-2 rounded-lg text-secondary hover:bg-secondary-fixed transition-all"
                    title="View profile"
                    aria-label={`View profile of ${fullName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                </button>

                {/* Remove button */}
                <button
                    onClick={() => setConfirming(true)}
                    className="mt-1 p-2 rounded-lg text-outline hover:text-error hover:bg-error-container transition-all"
                    title="Remove from saved"
                    aria-label={`Remove ${fullName} from saved`}
                >
                    <BookmarkIcon size={16} filled />
                </button>
            </div>

            {/* Mobile footer */}
            <div className="md:hidden flex items-center justify-between border-t border-dashed border-outline-variant px-5 py-3">
                <div className="flex items-center gap-1.5 text-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                    </svg>
                    <span className="font-label text-[10px] uppercase tracking-wider">{formatSavedAt(savedAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => onViewProfile(targetUserId)}
                            className="flex items-center gap-1.5 font-label text-xs text-secondary hover:underline px-2 py-1 rounded-lg transition-colors">
                        View profile
                    </button>
                    <button onClick={() => setConfirming(true)}
                            className="flex items-center gap-1.5 font-label text-xs text-outline hover:text-error transition-colors px-2 py-1 rounded-lg hover:bg-error-container">
                        Remove
                    </button>
                </div>
            </div>
        </article>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNavigate }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-tertiary-fixed opacity-40" />
                <BookmarkIcon size={32} filled={false} />
            </div>
            <div>
                <h2 className="font-headline font-extrabold text-xl text-primary tracking-tight mb-2">
                    No saved profiles yet
                </h2>
                <p className="font-body text-sm text-on-surface-variant max-w-sm leading-relaxed">
                    Save travelers from the feed when you want to revisit them later.
                    Saving does not create a match — it is just a bookmark.
                </p>
            </div>
            <button
                onClick={() => onNavigate?.("feed")}
                className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-6 py-2.5 rounded-xl font-headline font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
            >
                Back to Feed
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ─── SavedProfilesPage ────────────────────────────────────────────────────────
export default function SavedProfilesPage({ onNavigate, onViewProfile }) {
    const [profiles, setProfiles] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);

    const fetchSaved = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSavedProfiles();
            setProfiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message ?? "Failed to load saved profiles");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSaved(); }, [fetchSaved]);

    const handleRemove = useCallback((targetUserId) => {
        setProfiles((prev) => prev.filter((p) => p.targetUserId !== targetUserId));
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="space-y-8">

            {/* Header */}
            <section className="relative bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] overflow-hidden">
                <div className="h-28 md:h-36 w-full bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
                        <div className="absolute top-2 right-10 text-white text-[100px] font-headline font-extrabold leading-none">✈</div>
                    </div>
                </div>
                <div className="px-6 md:px-8 pb-6 md:pb-7 -mt-10 relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                    <div className="w-16 h-16 rounded-xl border-4 border-surface-container-lowest shadow-xl bg-tertiary-container flex items-center justify-center flex-shrink-0">
                        <BookmarkIcon size={26} filled />
                    </div>
                    <div className="flex-grow">
                        <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                            Saved Profiles
                        </h1>
                        <p className="font-label text-sm text-on-surface-variant mt-0.5 uppercase tracking-wider">
                            {profiles.length > 0
                                ? `${profiles.length} profile${profiles.length !== 1 ? "s" : ""} saved`
                                : "Travelers you want to revisit"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="bg-surface-container-lowest rounded-xl p-8 text-center border border-dashed" style={{ borderColor: "#ffdad6" }}>
                    <p className="font-body text-sm text-on-surface-variant mb-4">{error}</p>
                    <button onClick={fetchSaved}
                            className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-5 py-2.5 rounded-xl font-headline font-bold text-sm hover:shadow-lg transition-all active:scale-95">
                        Try again
                    </button>
                </div>
            )}

            {/* Empty */}
            {!error && profiles.length === 0 && <EmptyState onNavigate={onNavigate} />}

            {/* List */}
            {!error && profiles.length > 0 && (
                <div className="space-y-5">
                    {profiles.map((profile) => (
                        <SavedCard
                            key={profile.targetUserId}
                            profile={profile}
                            onRemove={handleRemove}
                            onViewProfile={onViewProfile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}