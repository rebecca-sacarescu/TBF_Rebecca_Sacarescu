import { useState, useEffect, useCallback } from "react";
import { getSavedProfiles, unsaveProfile } from "../services/savedProfilesApi";
import { BookmarkIcon } from "../components/Icons";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    white:      "#ffffff",
    error:      "#ba1a1a",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

// ─── Enum maps ────────────────────────────────────────────────────────────────
const SOCIAL_BATTERY = {
    INTROVERT:        { label: "Introvert" },
    AMBIVERT:         { label: "Ambivert" },
    EXTROVERT:        { label: "Extrovert" },
};
const PLANNING_STYLE = {
    SPONTANEOUS:      { label: "Spontaneous" },
    FLEXIBLE:         { label: "Flexible" },
    STRICT_ITINERARY: { label: "Planner" },
};
const BUDGET = {
    BUDGET_FRIENDLY:  { label: "Budget" },
    MODERATE:         { label: "Moderate" },
    LUXURY:           { label: "Luxury" },
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 0", fontFamily: SANS }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.grayWarm, borderRightColor: C.lavender, animation: "spin 0.9s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: "10px", fontWeight: 600, color: C.tan, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>Loading saved profiles...</p>
        </div>
    );
}

// ─── DNA pill ─────────────────────────────────────────────────────────────────
function DnaPill({ label }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "4px 10px", borderRadius: "999px",
            fontFamily: SANS, fontWeight: 600, fontSize: "11px",
            background: "rgba(175,154,201,0.18)", color: "#3a2d4a",
            border: "1px solid rgba(175,154,201,0.35)",
        }}>
            {label}
        </span>
    );
}

// ─── Remove confirm ───────────────────────────────────────────────────────────
function RemoveConfirm({ name, onConfirm, onCancel, loading }) {
    return (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(58,55,55,0.82)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 10, background: C.white, borderRadius: "16px", padding: "24px", margin: "24px", boxShadow: `0 8px 0 ${C.dark}, 0 16px 40px rgba(58,55,55,0.28)`, textAlign: "center", maxWidth: "280px", width: "100%", border: `1px solid ${C.tanBorder}` }}>
                <div style={{ width: "32px", height: "3px", background: C.tanBorder, borderRadius: "999px", margin: "0 auto 16px" }} />
                <p style={{ fontFamily: SERIF, fontSize: "17px", color: C.grayWarm, margin: "0 0 8px" }}>Remove from saved?</p>
                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: "0 0 20px", lineHeight: 1.55 }}>
                    <strong style={{ color: C.grayWarm }}>{name}</strong> will be removed from your saved list. They may still appear in your feed.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={onCancel} disabled={loading}
                            style={{ flex: 1, padding: "10px", borderRadius: "999px", fontFamily: SANS, fontWeight: 700, fontSize: "12px", background: C.beigeMid, border: `1px solid ${C.tanBorder}`, color: C.grayWarm, cursor: "pointer", boxShadow: `0 2px 0 #d4cec9` }}>
                        Keep
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                            style={{ flex: 1, padding: "10px", borderRadius: "999px", fontFamily: SANS, fontWeight: 700, fontSize: "12px", background: `linear-gradient(180deg, #c4847a 0%, ${C.error} 100%)`, border: "none", color: C.white, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, boxShadow: `0 3px 0 #7a4d47`, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        {loading ? (
                            <><div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.white, animation: "spin 0.8s linear infinite" }} />Removing...</>
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
    const scoreColor = compatibilityScore >= 80 ? C.lavender : compatibilityScore >= 60 ? C.sand : C.tan;

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

    const cardHover = (e, enter) => {
        e.currentTarget.style.boxShadow = enter
            ? `0 8px 0 #bfb9b4, 0 14px 40px rgba(165,147,123,0.16)`
            : `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`;
        e.currentTarget.style.transform = enter ? "translateY(-2px)" : "translateY(0)";
    };

    return (
        <article
            style={{
                position: "relative", background: C.white, borderRadius: "20px",
                overflow: "hidden", display: "flex", flexDirection: "row",
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
                transition: "box-shadow 0.20s ease, transform 0.20s ease",
            }}
            onMouseEnter={(e) => cardHover(e, true)}
            onMouseLeave={(e) => cardHover(e, false)}
        >
            {/* Accent strip */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />

            {confirming && (
                <RemoveConfirm
                    name={fullName}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => { setConfirming(false); setRemoveError(null); }}
                    loading={removeLoading}
                />
            )}

            {/* Photo */}
            <div style={{ position: "relative", flexShrink: 0, width: "140px", minHeight: "180px", overflow: "hidden", background: `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)` }}>
                {hasImg && (
                    <img src={profilePictureUrl} alt={fullName}
                         style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                         onError={(e) => { e.currentTarget.style.display = "none"; }} />
                )}
                {!hasImg && (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: SERIF, fontSize: "2.2rem", color: C.beigeLight, opacity: 0.18, letterSpacing: "0.1em" }}>{inits}</span>
                    </div>
                )}
                {showScore && (
                    <div style={{
                        position: "absolute", top: "10px", left: "10px",
                        padding: "4px 10px", borderRadius: "999px",
                        fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                        background: "rgba(255,255,255,0.90)", backdropFilter: "blur(6px)",
                        color: scoreColor, border: `1.5px solid ${scoreColor}44`,
                    }}>
                        {compatibilityScore}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 22px", gap: "10px", minWidth: 0 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: SERIF, fontSize: "clamp(1.1rem,2vw,1.35rem)", color: C.grayWarm, letterSpacing: "-0.01em", lineHeight: 1.1 }}>{fullName}</span>
                        {age != null && <span style={{ fontFamily: SANS, fontSize: "15px", color: C.tan }}>{age}</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: "5px" }}>
                        {currentLocation && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={C.tan}>
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan }}>{currentLocation}</span>
                            </div>
                        )}
                        {originCountry && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={C.tan} style={{ opacity: 0.60 }}>
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                </svg>
                                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan, opacity: 0.75 }}>{originCountry}</span>
                            </div>
                        )}
                    </div>
                </div>

                {bio && (
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.grayWarm, lineHeight: 1.60, margin: 0, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        "{bio}"
                    </p>
                )}

                {(socialBattery || planningStyle || budget) && (
                    <div>
                        <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 6px" }}>Travel DNA</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {socialBattery && SOCIAL_BATTERY[socialBattery] && <DnaPill label={SOCIAL_BATTERY[socialBattery].label} />}
                            {planningStyle  && PLANNING_STYLE[planningStyle]  && <DnaPill label={PLANNING_STYLE[planningStyle].label} />}
                            {budget         && BUDGET[budget]                  && <DnaPill label={BUDGET[budget].label} />}
                        </div>
                    </div>
                )}

                {removeError && <p style={{ fontFamily: SANS, fontSize: "11px", color: C.error, margin: 0 }}>{removeError}</p>}

                {/* Mobile actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px dashed ${C.tanBorder}`, paddingTop: "10px", marginTop: "auto" }} className="md:hidden">
                    <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.tan }}>
                        Saved {formatSavedAt(savedAt)}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => onViewProfile(targetUserId)}
                                style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", color: C.lavender, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
                            View profile
                        </button>
                        <button onClick={() => setConfirming(true)}
                                style={{ fontFamily: SANS, fontWeight: 700, fontSize: "10px", color: C.tan, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>
                            Remove
                        </button>
                    </div>
                </div>
            </div>

            {/* Right stub — desktop only */}
            <div className="hidden md:flex" style={{ flexDirection: "column", alignItems: "center", justifyContent: "space-between", flexShrink: 0, width: "80px", padding: "20px 14px", background: C.beigeMid, position: "relative", backgroundImage: `linear-gradient(to bottom, ${C.tan} 50%, transparent 0%)`, backgroundPosition: "left", backgroundSize: "1px 8px", backgroundRepeat: "repeat-y" }}>
                <div style={{ position: "absolute", left: "-10px", top: "20%", width: "20px", height: "20px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />
                <div style={{ position: "absolute", left: "-10px", bottom: "20%", width: "20px", height: "20px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />

                {/* Barcode */}
                <div style={{ display: "flex", gap: "2px", opacity: 0.18 }}>
                    {[0.5,1,0.5,2,0.5,1.5,0.5,1].map((w, i) => (
                        <div key={i} style={{ background: C.grayWarm, width: `${w*3}px`, height: "28px", borderRadius: "1px" }} />
                    ))}
                </div>

                {/* Saved date */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }}>
                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: 0 }}>Saved</p>
                    <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: "9px", color: C.grayWarm, margin: 0, textAlign: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "70px" }}>
                        {formatSavedAt(savedAt)}
                    </p>
                </div>

                {/* View profile */}
                <button
                    onClick={() => onViewProfile(targetUserId)}
                    style={{ padding: "8px", borderRadius: "10px", background: "none", border: "none", cursor: "pointer", color: C.lavender, transition: "background 0.15s ease" }}
                    title="View profile"
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(175,154,201,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>

                {/* Remove button */}
                <button
                    onClick={() => setConfirming(true)}
                    style={{ padding: "8px", borderRadius: "10px", background: "none", border: "none", cursor: "pointer", color: C.tan, transition: "all 0.15s ease" }}
                    title="Remove from saved"
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.error; e.currentTarget.style.background = "rgba(186,26,26,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.tan; e.currentTarget.style.background = "none"; }}
                >
                    <BookmarkIcon size={16} filled />
                </button>
            </div>
        </article>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNavigate }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "80px 24px", textAlign: "center", background: C.white, borderRadius: "20px", border: `1.5px dashed ${C.tanBorder}` }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(175,154,201,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookmarkIcon size={24} filled={false} />
            </div>
            <div>
                <p style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: "0 0 8px" }}>No saved profiles yet</p>
                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0, lineHeight: 1.6, maxWidth: "320px" }}>
                    Save travelers from the feed when you want to revisit them later. Saving does not create a match.
                </p>
            </div>
            <button
                onClick={() => onNavigate?.("feed")}
                style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12px", color: C.beigeLight, background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 100%)`, border: "none", borderRadius: "999px", padding: "11px 22px", cursor: "pointer", boxShadow: `0 4px 0 ${C.dark}`, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
                Back to Feed
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "32px", fontFamily: SANS }}>

            {/* Header */}
            <section style={{ background: C.white, borderRadius: "20px", border: `1px solid ${C.tanBorder}`, boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`, overflow: "hidden" }}>
                <div style={{ height: "100px", background: `linear-gradient(135deg, ${C.grayWarm} 0%, #575353 40%, #4d4949 100%)`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, rgba(58,55,55,0.55) 100%)` }} />
                    <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill={C.beigeLight}>
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                        </svg>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />
                </div>
                <div style={{ padding: "0 24px 24px", display: "flex", alignItems: "flex-end", gap: "20px", marginTop: "-32px", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "14px", border: `3px solid ${C.beigeLight}`, boxShadow: `0 3px 0 #bfb9b4`, background: `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BookmarkIcon size={22} filled />
                    </div>
                    <div style={{ paddingBottom: "4px" }}>
                        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: C.grayWarm, margin: "0 0 2px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Saved Profiles</h1>
                        <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: 0 }}>
                            {profiles.length > 0 ? `${profiles.length} profile${profiles.length !== 1 ? "s" : ""} saved` : "Travelers you want to revisit"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Error */}
            {error && (
                <div style={{ background: C.white, borderRadius: "16px", border: `1.5px dashed rgba(186,26,26,0.30)`, padding: "24px", textAlign: "center" }}>
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: "0 0 14px" }}>{error}</p>
                    <button onClick={fetchSaved} style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12px", color: C.beigeLight, background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 100%)`, border: "none", borderRadius: "999px", padding: "10px 20px", cursor: "pointer", boxShadow: `0 3px 0 ${C.dark}` }}>
                        Try again
                    </button>
                </div>
            )}

            {/* Empty */}
            {!error && profiles.length === 0 && <EmptyState onNavigate={onNavigate} />}

            {/* List */}
            {!error && profiles.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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