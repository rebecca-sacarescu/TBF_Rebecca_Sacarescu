import { useState, useEffect, useRef, useCallback } from "react";
import { getDiscoverProfile, postDiscoverEvent } from "../services/discoverApi";
import { saveProfile, unsaveProfile } from "../services/savedProfilesApi";
import { postInteraction } from "../services/feedApi";
import TagList from "../components/TagList";
import { ChevronLeftIcon, BookmarkIcon, VerifiedIcon } from "../components/Icons";

// ─── Enum maps (same as FeedPage / MatchesPage) ───────────────────────────────
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

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-label text-sm text-outline uppercase tracking-widest">Loading traveler profile...</p>
        </div>
    );
}

// ─── DNA pill (read-only) ─────────────────────────────────────────────────────
function DnaPill({ icon, label }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label font-semibold text-sm bg-secondary-fixed text-on-secondary-fixed">
            <span>{icon}</span>{label}
        </span>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }) {
    return (
        <section className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] p-6 md:p-8">
            {title && (
                <h2 className="font-headline font-bold text-lg text-primary mb-5 flex items-center gap-2">
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

// ─── DiscoverProfilePage ──────────────────────────────────────────────────────
export default function DiscoverProfilePage({ profileId, fromPage = "feed", onNavigate }) {
    const [profile,     setProfile]     = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [isSaved,     setIsSaved]     = useState(false);
    const [savingState, setSavingState] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);

    const dwellStartRef = useRef(Date.now());

    // ── Fetch profile + open event ─────────────────────────────────────────
    useEffect(() => {
        if (!profileId) return;
        let cancelled = false;

        dwellStartRef.current = Date.now();
        postDiscoverEvent(profileId, { eventType: "FULL_PROFILE_OPEN", surface: "FULL_PROFILE" });

        setLoading(true);
        setError(null);

        getDiscoverProfile(profileId)
            .then((data) => {
                if (cancelled) return;
                setProfile(data);
                setIsSaved(data.saved ?? false);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message ?? "Failed to load profile");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        // ── Dwell event on unmount ─────────────────────────────────────────
        return () => {
            cancelled = true;
            const dwellTimeMs = Date.now() - dwellStartRef.current;
            postDiscoverEvent(profileId, { eventType: "DWELL_RECORDED", surface: "FULL_PROFILE", dwellTimeMs });
        };
    }, [profileId]);

    const handleBack = useCallback(() => {
        onNavigate(fromPage);
    }, [onNavigate, fromPage]);

    // ── Save / Unsave ─────────────────────────────────────────────────────
    const handleToggleSave = useCallback(async () => {
        if (savingState) return;
        const prevSaved = isSaved;
        setIsSaved(!prevSaved);
        setSavingState(true);
        try {
            if (prevSaved) {
                await unsaveProfile(profileId);
                postDiscoverEvent(profileId, { eventType: "UNSAVE", surface: "FULL_PROFILE" });
            } else {
                await saveProfile(profileId);
                postDiscoverEvent(profileId, { eventType: "SAVE", surface: "FULL_PROFILE" });
            }
        } catch {
            setIsSaved(prevSaved); // revert
        } finally {
            setSavingState(false);
        }
    }, [savingState, isSaved, profileId]);

    // ── Swipe decision ────────────────────────────────────────────────────
    const handleDecision = useCallback(async (action) => {
        if (actionTaken) return;
        setActionTaken(true);
        postInteraction(profileId, action).catch(() => {});
        // Navigate back — feed will skip this profile on next load
        setTimeout(() => onNavigate(fromPage), 280);
    }, [actionTaken, profileId, fromPage, onNavigate]);

    if (loading) return <Spinner />;

    if (error) {
        return (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
                <p className="font-body text-sm text-on-surface-variant">{error}</p>
                <button onClick={handleBack}
                        className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-5 py-2.5 rounded-xl font-headline font-bold text-sm hover:shadow-lg transition-all active:scale-95">
                    Go back
                </button>
            </div>
        );
    }

    if (!profile) return null;

    const {
        fullName = "", age, gender, originCountry, originCity, currentLocation,
        bio, profilePictureUrl, verificationStatus,
        socialBattery, planningStyle, budget,
        activities = [], destinationTypes = [], experienceTypes = [],
        languages = [], lookingForWho = [], lookingForWhat = [],
        compatibilityScore,
    } = profile;

    const inits          = getInitials(fullName);
    const hasImg         = !!profilePictureUrl;
    const isVerified     = verificationStatus === "VERIFIED_USER";
    const showScore      = compatibilityScore != null && Number(compatibilityScore) > 0;
    const scoreColor     = compatibilityScore >= 80 ? "#0c6780" : compatibilityScore >= 60 ? "#d97706" : "#737780";
    const hasOrigin      = originCity || originCountry;
    const originDisplay  = [originCity, originCountry].filter(Boolean).join(", ");

    return (
        <div className="space-y-5 pb-8">

            {/* ── Hero section ────────────────────────────────────────────── */}
            <section className="relative bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] overflow-hidden">
                {/* Cover */}
                <div className="h-44 md:h-52 w-full bg-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
                        <div className="absolute top-2 right-10 text-white text-[100px] font-headline font-extrabold leading-none">✈</div>
                    </div>

                    {/* Back button — overlaid on cover */}
                    <button
                        onClick={handleBack}
                        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-xl font-label font-bold text-xs uppercase tracking-wider transition-all hover:bg-white/20 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.90)" }}
                    >
                        <ChevronLeftIcon size={16} />
                        Back
                    </button>

                    {/* Save button — overlaid on cover top right */}
                    <button
                        onClick={handleToggleSave}
                        disabled={savingState}
                        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-xl font-label font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                        style={{
                            background:    isSaved ? "rgba(255,183,125,0.20)" : "rgba(255,255,255,0.12)",
                            backdropFilter:"blur(8px)",
                            color:         isSaved ? "#ffb77d" : "rgba(255,255,255,0.90)",
                            border:        isSaved ? "1px solid rgba(255,183,125,0.50)" : "1px solid rgba(255,255,255,0.20)",
                        }}
                        aria-label={isSaved ? "Remove from saved" : "Save profile"}
                    >
                        <BookmarkIcon size={14} filled={isSaved} />
                        {isSaved ? "Saved" : "Save"}
                    </button>
                </div>

                {/* Profile info bar */}
                <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col md:flex-row items-start md:items-end -mt-16 relative z-10 gap-4 md:gap-6">
                    {/* Photo */}
                    <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl border-4 border-surface-container-lowest shadow-xl bg-primary overflow-hidden">
                            {hasImg ? (
                                <img src={profilePictureUrl} alt={fullName} className="w-full h-full object-cover"
                                     onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="font-headline font-extrabold text-on-primary select-none"
                                          style={{ fontSize: "2.2rem", opacity: 0.18, letterSpacing: "0.1em" }}>{inits}</span>
                                </div>
                            )}
                        </div>
                        {/* Verified badge */}
                        {isVerified && (
                            <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full border-4 border-surface-container-lowest bg-secondary text-on-secondary">
                                <VerifiedIcon size={12} />
                            </div>
                        )}
                    </div>

                    {/* Name block */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                                {fullName}
                            </h1>
                            {age != null && (
                                <span className="font-body text-xl text-on-surface-variant">{age}</span>
                            )}
                        </div>

                        {/* Location meta — boarding pass gate info style */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                            {currentLocation && (
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                    <span className="font-label text-xs uppercase tracking-wider">{currentLocation}</span>
                                </div>
                            )}
                            {hasOrigin && (
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-outline">
                                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                    </svg>
                                    <span className="font-label text-xs uppercase tracking-wider">From {originDisplay}</span>
                                </div>
                            )}
                            {gender && (
                                <span className="font-label text-xs uppercase tracking-wider text-outline">{gender}</span>
                            )}
                        </div>
                    </div>

                    {/* Compatibility score — right side */}
                    {showScore && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-0.5 self-center md:self-end mb-1">
                            <span className="font-headline font-extrabold text-3xl leading-none" style={{ color: scoreColor }}>
                                {compatibilityScore}%
                            </span>
                            <span className="font-label text-[9px] uppercase tracking-widest text-outline">Match</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Bio ─────────────────────────────────────────────────────── */}
            {bio && (
                <Section>
                    {/* Boarding pass perforation header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex gap-0.5 opacity-20">
                            {[0.5, 1, 0.5, 2, 0.5, 1.5].map((w, i) => (
                                <div key={i} className="bg-primary" style={{ width: `${w * 3}px`, height: "20px" }} />
                            ))}
                        </div>
                        <p className="font-label text-[10px] uppercase tracking-widest text-outline">About</p>
                    </div>
                    <p className="font-body text-base text-on-surface-variant leading-relaxed italic">
                        "{bio}"
                    </p>
                </Section>
            )}

            {/* ── Travel DNA ──────────────────────────────────────────────── */}
            {(socialBattery || planningStyle || budget) && (
                <Section title={
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Travel DNA
                    </span>
                }>
                    <div className="flex flex-wrap gap-2">
                        {socialBattery && SOCIAL_BATTERY[socialBattery] && <DnaPill {...SOCIAL_BATTERY[socialBattery]} />}
                        {planningStyle && PLANNING_STYLE[planningStyle] && <DnaPill {...PLANNING_STYLE[planningStyle]} />}
                        {budget && BUDGET[budget] && <DnaPill {...BUDGET[budget]} />}
                    </div>
                </Section>
            )}

            {/* ── Interests & Preferences ─────────────────────────────────── */}
            {(activities.length > 0 || destinationTypes.length > 0 || experienceTypes.length > 0 ||
                languages.length > 0 || lookingForWho.length > 0 || lookingForWhat.length > 0) && (
                <Section title={
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Interests &amp; Preferences
                    </span>
                }>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            {activities.length > 0 && (
                                <TagList label="Favorite Activities" items={activities} editing={false} variant="default" />
                            )}
                            {languages.length > 0 && (
                                <TagList label="Languages" items={languages} editing={false} variant="tertiary" />
                            )}
                            {lookingForWhat.length > 0 && (
                                <TagList label="Looking For" items={lookingForWhat} editing={false} variant="neutral" />
                            )}
                        </div>
                        <div className="space-y-5">
                            {destinationTypes.length > 0 && (
                                <TagList label="Destination Types" items={destinationTypes} editing={false} variant="secondary" />
                            )}
                            {experienceTypes.length > 0 && (
                                <TagList label="Experience Types" items={experienceTypes} editing={false} variant="default" />
                            )}
                            {lookingForWho.length > 0 && (
                                <TagList label="Travel With" items={lookingForWho} editing={false} variant="neutral" />
                            )}
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Action bar ──────────────────────────────────────────────── */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,29,69,0.04)] p-5 md:p-6">
                {/* Dashed separator — boarding pass aesthetic */}
                <div className="relative flex items-center mb-5">
                    <div className="absolute -left-7 w-5 h-5 rounded-full bg-surface" />
                    <div className="flex-1 border-t border-dashed border-outline-variant" />
                    <div className="absolute -right-7 w-5 h-5 rounded-full bg-surface" />
                </div>

                <p className="font-label text-[9px] uppercase tracking-widest text-outline text-center mb-4">
                    Your decision
                </p>

                <div className="flex items-center justify-center gap-6 md:gap-8">
                    {/* Pass */}
                    <div className="flex flex-col items-center gap-1.5">
                        <button
                            onClick={() => handleDecision("NO")}
                            disabled={actionTaken}
                            aria-label="Pass"
                            className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ width: "54px", height: "54px", background: "#ffffff", boxShadow: "0 4px 16px rgba(186,26,26,0.14)", border: "1.5px solid #ffdad6", color: "#ba1a1a" }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <span className="font-label text-[9px] uppercase tracking-widest text-outline">Pass</span>
                    </div>

                    {/* Super Like */}
                    <div className="flex flex-col items-center gap-1.5">
                        <button
                            onClick={() => handleDecision("SUPER_LIKE")}
                            disabled={actionTaken}
                            aria-label="Super Like"
                            className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ width: "62px", height: "62px", background: "#001d45", boxShadow: "0 6px 24px rgba(0,29,69,0.28)", color: "#ffb77d" }}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                        <span className="font-label text-[9px] uppercase tracking-widest text-outline">Super</span>
                    </div>

                    {/* Yes */}
                    <div className="flex flex-col items-center gap-1.5">
                        <button
                            onClick={() => handleDecision("YES")}
                            disabled={actionTaken}
                            aria-label="Yes"
                            className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ width: "54px", height: "54px", background: "#ffffff", boxShadow: "0 4px 16px rgba(12,103,128,0.14)", border: "1.5px solid #9ae1ff", color: "#0c6780" }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </button>
                        <span className="font-label text-[9px] uppercase tracking-widest text-outline">Yes</span>
                    </div>
                </div>

                {actionTaken && (
                    <p className="font-label text-xs text-outline text-center mt-4 uppercase tracking-widest">
                        Decision recorded — returning...
                    </p>
                )}
            </div>
        </div>
    );
}