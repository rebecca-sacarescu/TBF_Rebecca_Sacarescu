import { useState, useRef, useCallback, useEffect } from "react";
import { getFeed, postInteraction } from "../services/feedApi";
import { saveProfile, unsaveProfile } from "../services/savedProfilesApi";
import { postDiscoverEvent } from "../services/discoverApi";
import { FlightIcon, BookmarkIcon, EyeIcon } from "../components/Icons";

// ─── Enum → label maps (mirrors MyProfilePage option configs) ─────────────
const SOCIAL_BATTERY = {
    INTROVERT: { label: "Introvert" },
    AMBIVERT: { label: "Ambivert" },
    EXTROVERT: { label: "Extrovert" },
};

const PLANNING_STYLE = {
    SPONTANEOUS: { label: "Spontaneous" },
    FLEXIBLE: { label: "Flexible" },
    STRICT_ITINERARY: { label: "Planner" },
};

const BUDGET = {
    BUDGET_FRIENDLY: { label: "Budget" },
    MODERATE: { label: "Moderate" },
    LUXURY: { label: "Luxury" },
};

// ─── Swipe constants ──────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 75;
const EXIT_DISTANCE = 680;
const EXIT_MS = 380;
const DOUBLE_TAP_MS = 300;
const ROTATION_MAX_DEG = 18;

// ─── Utility: initials from fullName ─────────────────────────────────────
function initials(fullName = "") {
    return fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}

// ─── Loading spinner — matches App.jsx / MyProfilePage style exactly ─────
function Spinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center gap-3 py-32">
            <svg
                className="animate-spin h-8 w-8 text-secondary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="font-label text-sm text-outline uppercase tracking-widest">{label}</p>
        </div>
    );
}

// ─── Pill components — use exact token classes from tailwind.config.js ───
function DnaPill({ label }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label font-semibold text-xs bg-secondary-fixed text-on-secondary-fixed">
            {label}
        </span>
    );
}

function ActivityPill({ label }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label font-medium text-xs bg-surface-container text-on-surface-variant border border-outline-variant">
            {label}
        </span>
    );
}

function LanguagePill({ label }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label font-medium text-xs bg-primary-fixed text-on-primary-fixed-variant">
            {label}
        </span>
    );
}

function LookingForPill({ label }) {
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full font-label font-semibold text-xs bg-tertiary-fixed text-on-tertiary-fixed">
            {label}
        </span>
    );
}

// ─── Boarding-pass perforation line ───────────────────────────────────────
function Perforation() {
    return (
        <div className="relative flex-shrink-0 flex items-center" style={{ height: "18px" }}>
            <div className="absolute -left-3 w-5 h-5 rounded-full bg-surface" />
            <div className="flex-1 mx-3 border-t border-dashed border-outline-variant" />
            <div className="absolute -right-3 w-5 h-5 rounded-full bg-surface" />
        </div>
    );
}

// ─── Empty feed ────────────────────────────────────────────────────────────
function EmptyFeed({ onNavigate }) {
    return (
        <div
            className="w-full h-full rounded-xl bg-surface-container-lowest flex flex-col items-center justify-center gap-6 text-center px-8"
            style={{
                boxShadow: "0 24px 48px rgba(0,29,69,0.06)",
                border: "1.5px dashed",
                borderColor: "#c3c6d1",
            }}
        >
            <div className="text-outline opacity-30">
                <FlightIcon size={52} />
            </div>
            <div>
                <p className="font-headline font-extrabold text-xl text-primary tracking-tight mb-1">
                    You've reviewed everyone for now
                </p>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    New travelers join daily.<br />Check back soon.
                </p>
            </div>
            <button
                onClick={() => onNavigate?.("matches")}
                className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-6 py-2.5 rounded-xl font-headline font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
            >
                View your Matches
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ─── Error state ───────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div
            className="w-full h-full rounded-xl bg-surface-container-lowest flex flex-col items-center justify-center gap-4 text-center px-8"
            style={{ border: "1.5px dashed", borderColor: "#ffdad6" }}
        >
            <p className="font-body text-sm text-on-surface-variant">{message}</p>
            <button
                onClick={onRetry}
                className="bg-gradient-to-r from-secondary to-primary-container text-on-secondary px-5 py-2.5 rounded-xl font-headline font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
                Try again
            </button>
        </div>
    );
}

// ─── Progress dots ─────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
    const count = Math.min(total, 5);
    const active = current % count;
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                        width: i === active ? "20px" : "6px",
                        height: "6px",
                        background: i === active ? "#001d45" : "#c3c6d1",
                    }}
                />
            ))}
        </div>
    );
}

// ─── Profile card ──────────────────────────────────────────────────────────
function ProfileCard({
                         profile,
                         dragX,
                         isDragging,
                         isExiting,
                         exitDirection,
                         onPointerDown,
                         onPointerMove,
                         onPointerUp,
                         onPointerCancel,
                         onToggleSave,
                         onViewProfile,
                         isSaved = false,
                         isSaveLoading = false,
                         isBack = false,
                     }) {
    const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
    const rotation = (dragX / EXIT_DISTANCE) * ROTATION_MAX_DEG;

    let transform;
    let transition;

    if (isBack) {
        const scale = 0.96 + progress * 0.04;
        transform = `scale(${scale})`;
        transition = "transform 0.15s ease";
    } else if (isExiting) {
        if (exitDirection === "right") transform = `translateX(${EXIT_DISTANCE}px) rotate(${ROTATION_MAX_DEG}deg)`;
        else if (exitDirection === "left") transform = `translateX(-${EXIT_DISTANCE}px) rotate(-${ROTATION_MAX_DEG}deg)`;
        else transform = `translateY(-${EXIT_DISTANCE}px) scale(1.04)`;
        transition = `transform ${EXIT_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    } else {
        transform = `translateX(${dragX}px) rotate(${rotation}deg)`;
        transition = isDragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    }

    const yesOp = (!isBack && dragX > 20) ? Math.min((dragX - 20) / (SWIPE_THRESHOLD - 20), 1) : 0;
    const noOp = (!isBack && dragX < -20) ? Math.min((-dragX - 20) / (SWIPE_THRESHOLD - 20), 1) : 0;
    const superOn = !isBack && isExiting && exitDirection === "super";

    const {
        profilePictureUrl,
        fullName = "",
        age,
        currentLocation,
        bio,
        socialBattery,
        planningStyle,
        budget,
        activities = [],
        languages = [],
        lookingForWhat = [],
        compatibilityScore,
    } = profile;

    const inits = initials(fullName);
    const hasImg = !!profilePictureUrl;
    const shownActivities = activities.slice(0, 2);
    const extraCount = Math.max(0, activities.length - 2);
    const shownLanguages = languages.slice(0, 2);
    const lookingFor = Array.isArray(lookingForWhat) ? lookingForWhat[0] : lookingForWhat;
    const showScore = compatibilityScore != null && Number(compatibilityScore) > 0;

    const stopSwipe = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="absolute inset-0 select-none"
            style={{ transform, transition, cursor: isBack ? "default" : "grab", touchAction: "none" }}
            onPointerDown={isBack ? undefined : onPointerDown}
            onPointerMove={isBack ? undefined : onPointerMove}
            onPointerUp={isBack ? undefined : onPointerUp}
            onPointerCancel={isBack ? undefined : onPointerCancel}
        >
            <div
                className="w-full h-full rounded-xl bg-surface-container-lowest overflow-hidden flex flex-col"
                style={{ boxShadow: isBack ? "0 8px 32px rgba(0,29,69,0.08)" : "0 24px 48px rgba(0,29,69,0.14)" }}
            >
                {/* ── Photo zone ──────────────────────────────────────────── */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "52%" }}>
                    {hasImg && (
                        <img
                            src={profilePictureUrl}
                            alt={fullName}
                            draggable={false}
                            className="w-full h-full object-cover pointer-events-none"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.style && (e.currentTarget.nextElementSibling.style.display = "flex");
                            }}
                        />
                    )}

                    <div
                        className="w-full h-full items-center justify-center bg-primary"
                        style={{ display: hasImg ? "none" : "flex" }}
                    >
                        <span
                            className="font-headline font-extrabold text-on-primary select-none"
                            style={{ fontSize: "clamp(2.5rem,10vw,4rem)", opacity: 0.18, letterSpacing: "0.1em" }}
                        >
                            {inits}
                        </span>
                    </div>

                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(255,255,255,0.12) 100%)" }}
                    />

                    {showScore && !isBack && (
                        <div
                            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full font-label font-bold text-xs"
                            style={{
                                background: "rgba(0,29,69,0.60)",
                                backdropFilter: "blur(8px)",
                                color: "#ffb77d",
                                border: "1px solid rgba(255,183,125,0.40)",
                            }}
                        >
                            ✦ {compatibilityScore}%
                        </div>
                    )}

                    {!isBack && (
                        <button
                            type="button"
                            onPointerDown={stopSwipe}
                            onPointerUp={stopSwipe}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSave?.();
                            }}
                            disabled={isSaveLoading}
                            className="absolute top-3 left-3 flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                            style={{
                                background: isSaved ? "rgba(0,29,69,0.82)" : "rgba(255,255,255,0.88)",
                                backdropFilter: "blur(8px)",
                                color: isSaved ? "#ffb77d" : "#001d45",
                                border: isSaved
                                    ? "1px solid rgba(255,183,125,0.45)"
                                    : "1px solid rgba(0,29,69,0.16)",
                                boxShadow: "0 8px 20px rgba(0,29,69,0.10)",
                            }}
                            aria-label={isSaved ? "Remove from saved" : "Save profile"}
                            title={isSaved ? "Saved" : "Save"}
                        >
                            <BookmarkIcon size={14} filled={isSaved} />
                        </button>
                    )}

                    <div
                        className="absolute inset-0 pointer-events-none flex items-start justify-start p-4"
                        style={{ background: `rgba(12,103,128,${yesOp * 0.20})`, opacity: yesOp }}
                    >
                        <div
                            className="font-headline font-extrabold text-xl tracking-widest uppercase px-3 py-1.5 rounded"
                            style={{
                                color: "#0c6780",
                                border: "3px solid #0c6780",
                                background: "rgba(255,255,255,0.88)",
                                transform: "rotate(-14deg)",
                            }}
                        >
                            YES ✓
                        </div>
                    </div>

                    <div
                        className="absolute inset-0 pointer-events-none flex items-start justify-end p-4"
                        style={{ background: `rgba(186,26,26,${noOp * 0.20})`, opacity: noOp }}
                    >
                        <div
                            className="font-headline font-extrabold text-xl tracking-widest uppercase px-3 py-1.5 rounded"
                            style={{
                                color: "#ba1a1a",
                                border: "3px solid #ba1a1a",
                                background: "rgba(255,255,255,0.88)",
                                transform: "rotate(14deg)",
                            }}
                        >
                            PASS ✕
                        </div>
                    </div>

                    {superOn && (
                        <div
                            className="absolute inset-0 pointer-events-none flex items-center justify-center"
                            style={{ background: "rgba(255,183,125,0.18)" }}
                        >
                            <div
                                className="font-headline font-extrabold text-2xl tracking-widest uppercase px-4 py-2 rounded"
                                style={{
                                    color: "#6e3900",
                                    border: "3px solid #ffb77d",
                                    background: "rgba(255,255,255,0.90)",
                                }}
                            >
                                ★ SUPER
                            </div>
                        </div>
                    )}
                </div>

                <Perforation />

                {/* ── Card body ────────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden flex flex-col gap-2.5 px-5 pt-1 pb-4" style={{ minHeight: 0 }}>
                    <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-headline font-extrabold text-xl text-primary leading-tight tracking-tight">
                                {fullName}
                            </span>
                            {age != null && (
                                <span className="font-body text-base text-on-surface-variant">
                                    {age}
                                </span>
                            )}
                        </div>

                        {currentLocation && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="11"
                                    height="11"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-secondary flex-shrink-0"
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                                    {currentLocation}
                                </span>
                            </div>
                        )}
                    </div>

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

                    {(socialBattery || planningStyle || budget) && (
                        <div>
                            <p className="font-label text-[9px] uppercase tracking-widest text-outline mb-1.5">
                                Travel DNA
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {socialBattery && SOCIAL_BATTERY[socialBattery] && (
                                    <DnaPill label={SOCIAL_BATTERY[socialBattery].label} />
                                )}
                                {planningStyle && PLANNING_STYLE[planningStyle] && (
                                    <DnaPill label={PLANNING_STYLE[planningStyle].label} />
                                )}
                                {budget && BUDGET[budget] && (
                                    <DnaPill label={BUDGET[budget].label} />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 items-center">
                        {shownActivities.map((a) => <ActivityPill key={a} label={a} />)}
                        {extraCount > 0 && (
                            <span className="font-label text-xs text-outline">+{extraCount}</span>
                        )}
                        {shownLanguages.map((l) => <LanguagePill key={l} label={l} />)}
                        {lookingFor && <LookingForPill label={lookingFor} />}
                    </div>

                    {!isBack && (
                        <button
                            type="button"
                            onPointerDown={stopSwipe}
                            onPointerUp={stopSwipe}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewProfile?.();
                            }}
                            className="mt-auto self-end flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest text-outline hover:text-secondary transition-colors py-1"
                        >
                            <EyeIcon size={13} />
                            Full profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── FeedPage ──────────────────────────────────────────────────────────────
export default function FeedPage({ onNavigate, onViewProfile }) {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [exitDirection, setExitDirection] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const [savedIds, setSavedIds] = useState(new Set());
    const [savingIds, setSavingIds] = useState(new Set());

    const dragStartX = useRef(0);
    const lastTapTime = useRef(0);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        setError(null);
        setCurrentIndex(0);
        try {
            const data = await getFeed();
            setProfiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message ?? "Failed to load feed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    useEffect(() => {
        const handler = (e) => {
            if (isAnimating || loading || error) return;
            if (e.key === "ArrowRight") triggerDecision("right");
            if (e.key === "ArrowLeft") triggerDecision("left");
            if (e.key === " ") {
                e.preventDefault();
                triggerDecision("super");
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    });

    const triggerDecision = useCallback(async (direction) => {
        if (isAnimating || currentIndex >= profiles.length) return;

        const profile = profiles[currentIndex];
        const actionMap = { right: "YES", left: "NO", super: "SUPER_LIKE" };

        setIsAnimating(true);
        setIsExiting(true);
        setExitDirection(direction);

        postInteraction(profile.userId, actionMap[direction]).catch(() => {});

        if (direction === "left") {
            setSavedIds((prev) => {
                const next = new Set(prev);
                next.delete(profile.userId);
                return next;
            });
        }

        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setIsExiting(false);
            setExitDirection(null);
            setDragX(0);
            setIsAnimating(false);
        }, EXIT_MS + 30);
    }, [isAnimating, currentIndex, profiles]);

    const handleToggleSave = useCallback(async (userId) => {
        const currentlySaving = savingIds.has(userId);
        if (currentlySaving) return;

        const isSaved = savedIds.has(userId);

        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSaved) next.delete(userId);
            else next.add(userId);
            return next;
        });

        setSavingIds((prev) => {
            const next = new Set(prev);
            next.add(userId);
            return next;
        });

        try {
            if (isSaved) {
                await unsaveProfile(userId);
                postDiscoverEvent(userId, { eventType: "UNSAVE", surface: "FEED_CARD" });
            } else {
                await saveProfile(userId);
                postDiscoverEvent(userId, { eventType: "SAVE", surface: "FEED_CARD" });
            }
        } catch {
            setSavedIds((prev) => {
                const next = new Set(prev);
                if (isSaved) next.add(userId);
                else next.delete(userId);
                return next;
            });
        } finally {
            setSavingIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    }, [savedIds, savingIds]);

    const handleViewProfile = useCallback((userId) => {
        postDiscoverEvent(userId, { eventType: "CARD_CLICK", surface: "FEED_CARD" });
        if (onViewProfile) {
            onViewProfile(userId);
            return;
        }
        onNavigate?.("discover", { targetUserId: userId });
    }, [onNavigate, onViewProfile]);

    const onPointerDown = useCallback((e) => {
        if (isAnimating) return;
        const now = Date.now();
        if (now - lastTapTime.current < DOUBLE_TAP_MS) {
            lastTapTime.current = 0;
            triggerDecision("super");
            return;
        }
        lastTapTime.current = now;
        dragStartX.current = e.clientX;
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    }, [isAnimating, triggerDecision]);

    const onPointerMove = useCallback((e) => {
        if (!isDragging) return;
        setDragX(e.clientX - dragStartX.current);
    }, [isDragging]);

    const onPointerUp = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragX > SWIPE_THRESHOLD) triggerDecision("right");
        else if (dragX < -SWIPE_THRESHOLD) triggerDecision("left");
        else setDragX(0);
    }, [isDragging, dragX, triggerDecision]);

    const onPointerCancel = useCallback(() => {
        setIsDragging(false);
        setDragX(0);
    }, []);

    const currentProfile = profiles[currentIndex];
    const nextProfile = profiles[currentIndex + 1];
    const isFeedDone = !loading && !error && !currentProfile;
    const hasContent = !loading && !error && !!currentProfile;

    if (loading) return <Spinner label="Finding travelers..." />;

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="w-full text-center">
                <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-primary tracking-tight">
                    Discover
                </h1>
                <p className="font-body text-sm text-on-surface-variant mt-0.5">
                    People worth traveling with
                </p>
            </div>

            <div
                className="relative w-full flex-shrink-0"
                style={{
                    maxWidth: "420px",
                    height: "clamp(480px, 66vh, 610px)",
                }}
            >
                {error ? (
                    <ErrorState message={error} onRetry={fetchFeed} />
                ) : isFeedDone ? (
                    <EmptyFeed onNavigate={onNavigate} />
                ) : (
                    <>
                        {nextProfile && (
                            <ProfileCard
                                key={`back-${nextProfile.userId}`}
                                profile={nextProfile}
                                dragX={dragX}
                                isDragging={isDragging}
                                isExiting={false}
                                exitDirection={null}
                                isBack
                            />
                        )}

                        <ProfileCard
                            key={`card-${currentProfile.userId}`}
                            profile={currentProfile}
                            dragX={dragX}
                            isDragging={isDragging}
                            isExiting={isExiting}
                            exitDirection={exitDirection}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerCancel}
                            isSaved={savedIds.has(currentProfile.userId)}
                            isSaveLoading={savingIds.has(currentProfile.userId)}
                            onToggleSave={() => handleToggleSave(currentProfile.userId)}
                            onViewProfile={() => handleViewProfile(currentProfile.userId)}
                        />
                    </>
                )}
            </div>

            {hasContent && (
                <div className="flex items-center gap-6 md:gap-8">
                    <button
                        onClick={() => triggerDecision("left")}
                        disabled={isAnimating}
                        aria-label="Pass"
                        className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            width: "54px",
                            height: "54px",
                            background: "#ffffff",
                            boxShadow: "0 4px 16px rgba(186,26,26,0.14)",
                            border: "1.5px solid #ffdad6",
                            color: "#ba1a1a",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <button
                        onClick={() => triggerDecision("super")}
                        disabled={isAnimating}
                        aria-label="Super Like"
                        className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            width: "62px",
                            height: "62px",
                            background: "#001d45",
                            boxShadow: "0 6px 24px rgba(0,29,69,0.28)",
                            color: "#ffb77d",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => triggerDecision("right")}
                        disabled={isAnimating}
                        aria-label="Yes"
                        className="flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            width: "54px",
                            height: "54px",
                            background: "#ffffff",
                            boxShadow: "0 4px 16px rgba(12,103,128,0.14)",
                            border: "1.5px solid #9ae1ff",
                            color: "#0c6780",
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                </div>
            )}

            {hasContent && profiles.length > 1 && (
                <ProgressDots total={profiles.length} current={currentIndex} />
            )}

            {hasContent && (
                <p className="font-label text-[10px] uppercase tracking-widest text-outline text-center pb-4">
                    Swipe or tap · right = yes · left = pass · double tap = super like
                </p>
            )}
        </div>
    );
}