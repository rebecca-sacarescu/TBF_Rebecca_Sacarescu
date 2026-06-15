import { useState, useEffect, useRef, useCallback } from "react";
import { getDiscoverProfile, postDiscoverEvent } from "../services/discoverApi";
import { saveProfile, unsaveProfile } from "../services/savedProfilesApi";
import { postInteraction } from "../services/feedApi";
import TagList from "../components/TagList";
import { ChevronLeftIcon, BookmarkIcon, VerifiedIcon } from "../components/Icons";

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

const SOCIAL_BATTERY  = { INTROVERT: "Introvert", AMBIVERT: "Ambivert",    EXTROVERT: "Extrovert" };
const PLANNING_STYLE  = { SPONTANEOUS: "Spontaneous", FLEXIBLE: "Flexible", STRICT_ITINERARY: "Planner" };
const BUDGET          = { BUDGET_FRIENDLY: "Budget", MODERATE: "Moderate",  LUXURY: "Luxury" };

function getInitials(name = "") {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Spinner() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 0", fontFamily: SANS }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.grayWarm, borderRightColor: C.lavender, animation: "spin 0.9s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: "10px", fontWeight: 600, color: C.tan, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>
                Loading traveler profile...
            </p>
        </div>
    );
}

function DnaPill({ label }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "5px 13px", borderRadius: "999px",
            fontFamily: SANS, fontWeight: 600, fontSize: "12px",
            background: "rgba(175,154,201,0.18)",
            color: "#3a2d4a",
            border: "1px solid rgba(175,154,201,0.35)",
        }}>
            {label}
        </span>
    );
}
function SectionCard({ title, children }) {
    return (
        <section style={{
            background: C.white, borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            padding: "24px 28px",
        }}>
            {title && (
                <h2 style={{ fontFamily: SERIF, fontSize: "18px", color: C.grayWarm, margin: "0 0 18px", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

function ActionButton({ onClick, disabled, ariaLabel, size = 50, children, colorScheme = "neutral" }) {
    const schemes = {
        neutral: { bg: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`, shadow: `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.22)`, shadowDown: `0 1px 0 ${C.dark}`, color: C.beigeLight, border: "1px solid rgba(255,255,255,0.10)" },
        pass:    { bg: `linear-gradient(180deg, #c4847a 0%, #b07068 50%, #966059 100%)`,         shadow: `0 5px 0 #7a4d47, 0 8px 20px rgba(176,112,104,0.28)`,   shadowDown: `0 1px 0 #7a4d47`,   color: "#fff5f4",    border: "1px solid rgba(255,255,255,0.12)" },
        super:   { bg: `linear-gradient(180deg, #c4b8d9 0%, ${C.lavender} 50%, #9a88b8 100%)`,  shadow: `0 5px 0 #7d6a9e, 0 8px 20px rgba(175,154,201,0.30)`,   shadowDown: `0 1px 0 #7d6a9e`,   color: "#2d2040",    border: "1px solid rgba(255,255,255,0.20)" },
        yes:     { bg: `linear-gradient(180deg, #9ecfb0 0%, #7eba95 50%, #68a47e 100%)`,         shadow: `0 5px 0 #4d8262, 0 8px 20px rgba(126,186,149,0.28)`,   shadowDown: `0 1px 0 #4d8262`,   color: "#1a3326",    border: "1px solid rgba(255,255,255,0.18)" },
    };
    const s = schemes[colorScheme];
    const down = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = s.shadowDown; } };
    const up   = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = s.shadow; } };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <button
                onClick={onClick} disabled={disabled} aria-label={ariaLabel}
                onMouseDown={down} onMouseUp={up} onMouseLeave={up}
                style={{
                    width: `${size}px`, height: `${size}px`, borderRadius: "50%",
                    border: s.border, background: s.bg, color: s.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.38 : 1,
                    boxShadow: s.shadow, transform: "translateY(0)",
                    transition: "opacity 0.15s ease", flexShrink: 0,
                }}
            >
                {children}
            </button>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan }}>
                {ariaLabel}
            </span>
        </div>
    );
}

export default function DiscoverProfilePage({ profileId, fromPage = "feed", onNavigate }) {
    const [profile,     setProfile]     = useState(null);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [isSaved,     setIsSaved]     = useState(false);
    const [savingState, setSavingState] = useState(false);
    const [actionTaken, setActionTaken] = useState(false);

    const dwellStartRef = useRef(Date.now());

    useEffect(() => {
        if (!profileId) return;
        let cancelled = false;
        dwellStartRef.current = Date.now();
        postDiscoverEvent(profileId, { eventType: "FULL_PROFILE_OPEN", surface: "FULL_PROFILE" });
        setLoading(true); setError(null);

        getDiscoverProfile(profileId)
            .then((data) => { if (cancelled) return; setProfile(data); setIsSaved(data.saved ?? false); })
            .catch((err) => { if (cancelled) return; setError(err.message ?? "Failed to load profile"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => {
            cancelled = true;
            const dwellTimeMs = Date.now() - dwellStartRef.current;
            postDiscoverEvent(profileId, { eventType: "DWELL_RECORDED", surface: "FULL_PROFILE", dwellTimeMs });
        };
    }, [profileId]);

    const handleBack = useCallback(() => onNavigate(fromPage), [onNavigate, fromPage]);

    const handleToggleSave = useCallback(async () => {
        if (savingState) return;
        const prev = isSaved;
        setIsSaved(!prev); setSavingState(true);
        try {
            if (prev) { await unsaveProfile(profileId); postDiscoverEvent(profileId, { eventType: "UNSAVE", surface: "FULL_PROFILE" }); }
            else       { await saveProfile(profileId);   postDiscoverEvent(profileId, { eventType: "SAVE",   surface: "FULL_PROFILE" }); }
        } catch { setIsSaved(prev); }
        finally { setSavingState(false); }
    }, [savingState, isSaved, profileId]);

    const handleDecision = useCallback(async (action) => {
        if (actionTaken) return;
        setActionTaken(true);
        postInteraction(profileId, action).catch(() => {});
        setTimeout(() => onNavigate(fromPage), 280);
    }, [actionTaken, profileId, fromPage, onNavigate]);

    if (loading) return <Spinner />;

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "60px 0", textAlign: "center", fontFamily: SANS }}>
                <p style={{ fontSize: "14px", color: C.tan }}>{error}</p>
                <button onClick={handleBack} style={{ fontFamily: SANS, fontWeight: 700, fontSize: "13px", color: C.beigeLight, background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 100%)`, border: "none", borderRadius: "999px", padding: "11px 22px", cursor: "pointer", boxShadow: `0 4px 0 ${C.dark}` }}>
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

    const inits         = getInitials(fullName);
    const hasImg        = !!profilePictureUrl;
    const isVerified    = verificationStatus === "VERIFIED_USER";
    const showScore     = compatibilityScore != null && Number(compatibilityScore) > 0;
    const originDisplay = [originCity, originCountry].filter(Boolean).join(", ");
    const hasOrigin     = !!originDisplay;

    const scoreColor = compatibilityScore >= 80 ? C.lavender : compatibilityScore >= 60 ? C.sand : C.tan;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "32px", fontFamily: SANS }}>

            <section style={{
                background: C.white, borderRadius: "20px",
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
                overflow: "hidden",
            }}>
                <div style={{
                    height: "160px", width: "100%", position: "relative", overflow: "hidden",
                    background: `linear-gradient(135deg, ${C.grayWarm} 0%, #575353 40%, #4d4949 100%)`,
                }}>
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 50%, rgba(58,55,55,0.45) 100%)` }} />
                    <div style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 24 24" fill={C.beigeLight}>
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                        </svg>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />

                    <button
                        onClick={handleBack}
                        style={{
                            position: "absolute", top: "14px", left: "14px",
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "7px 14px", borderRadius: "999px",
                            fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                            textTransform: "uppercase", letterSpacing: "0.10em",
                            background: "rgba(233,227,222,0.14)", backdropFilter: "blur(8px)",
                            border: "1px solid rgba(233,227,222,0.25)",
                            color: C.beigeLight, cursor: "pointer",
                            transition: "background 0.18s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.24)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.14)"; }}
                    >
                        <ChevronLeftIcon size={14} />
                        Back
                    </button>

                    <button
                        onClick={handleToggleSave}
                        disabled={savingState}
                        aria-label={isSaved ? "Remove from saved" : "Save profile"}
                        style={{
                            position: "absolute", top: "14px", right: "14px",
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "7px 14px", borderRadius: "999px",
                            fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                            textTransform: "uppercase", letterSpacing: "0.10em",
                            background: isSaved ? "rgba(175,154,201,0.25)" : "rgba(233,227,222,0.14)",
                            backdropFilter: "blur(8px)",
                            border: isSaved ? "1px solid rgba(175,154,201,0.45)" : "1px solid rgba(233,227,222,0.25)",
                            color: isSaved ? C.lavender : C.beigeLight,
                            cursor: savingState ? "not-allowed" : "pointer",
                            opacity: savingState ? 0.6 : 1,
                        }}
                    >
                        <BookmarkIcon size={13} filled={isSaved} />
                        {isSaved ? "Saved" : "Save"}
                    </button>
                </div>

                <div style={{ padding: "0 24px 24px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px 20px", marginTop: "-52px", position: "relative", zIndex: 1 }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{
                            width: "96px", height: "96px", borderRadius: "16px",
                            border: `3px solid ${C.beigeLight}`,
                            boxShadow: `0 4px 0 #bfb9b4, 0 6px 16px rgba(58,55,55,0.18)`,
                            background: `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                            overflow: "hidden",
                        }}>
                            {hasImg ? (
                                <img src={profilePictureUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontFamily: SERIF, fontSize: "2rem", color: C.beigeLight, opacity: 0.15 }}>{inits}</span>
                                </div>
                            )}
                        </div>
                        {isVerified && (
                            <div style={{
                                position: "absolute", bottom: "-4px", right: "-4px",
                                padding: "4px", borderRadius: "50%",
                                background: C.lavender, border: `3px solid ${C.beigeLight}`,
                                display: "flex",
                            }}>
                                <VerifiedIcon size={10} />
                            </div>
                        )}
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: "160px", paddingTop: "60px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                            <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: C.grayWarm, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                                {fullName}
                            </h1>
                            {age != null && (
                                <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "16px", color: C.tan }}>{age}</span>
                            )}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: "6px" }}>
                            {currentLocation && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={C.tan}>
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan }}>{currentLocation}</span>
                                </div>
                            )}
                            {hasOrigin && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={C.tan} style={{ opacity: 0.60 }}>
                                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                    </svg>
                                    <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan, opacity: 0.70 }}>From {originDisplay}</span>
                                </div>
                            )}
                            {gender && (
                                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan, opacity: 0.60 }}>{gender}</span>
                            )}
                        </div>
                    </div>

                    {/* Score */}
                    {showScore && (
                        <div style={{ flexShrink: 0, textAlign: "center", paddingTop: "56px" }}>
                            <p style={{ fontFamily: SERIF, fontSize: "2.2rem", color: scoreColor, margin: "0 0 2px", lineHeight: 1 }}>
                                {compatibilityScore}%
                            </p>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: 0 }}>Match</p>
                        </div>
                    )}
                </div>
            </section>

            {bio && (
                <SectionCard title="About">
                    <div style={{ display: "flex", gap: "2px", marginBottom: "14px", opacity: 0.18 }}>
                        {[0.5,1,0.5,2,0.5,1.5,1,0.5].map((w, i) => (
                            <div key={i} style={{ background: C.grayWarm, width: `${w*3}px`, height: "16px", borderRadius: "1px" }} />
                        ))}
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: "14px", color: C.grayWarm, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>
                        "{bio}"
                    </p>
                </SectionCard>
            )}

            {(socialBattery || planningStyle || budget) && (
                <SectionCard title="Travel DNA">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {socialBattery && SOCIAL_BATTERY[socialBattery] && <DnaPill label={SOCIAL_BATTERY[socialBattery]} />}
                        {planningStyle  && PLANNING_STYLE[planningStyle]  && <DnaPill label={PLANNING_STYLE[planningStyle]} />}
                        {budget         && BUDGET[budget]                  && <DnaPill label={BUDGET[budget]} />}
                    </div>
                </SectionCard>
            )}

            {(activities.length > 0 || destinationTypes.length > 0 || experienceTypes.length > 0 ||
                languages.length > 0 || lookingForWho.length > 0 || lookingForWhat.length > 0) && (
                <SectionCard title="Interests & Preferences">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {activities.length > 0      && <TagList label="Favorite Activities" items={activities}      editing={false} variant="default"   />}
                            {languages.length > 0       && <TagList label="Languages"           items={languages}       editing={false} variant="tertiary"  />}
                            {lookingForWhat.length > 0  && <TagList label="Looking For"         items={lookingForWhat}  editing={false} variant="neutral"   />}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {destinationTypes.length > 0 && <TagList label="Destination Types"  items={destinationTypes} editing={false} variant="secondary" />}
                            {experienceTypes.length > 0  && <TagList label="Experience Types"   items={experienceTypes}  editing={false} variant="default"   />}
                            {lookingForWho.length > 0    && <TagList label="Travel With"        items={lookingForWho}    editing={false} variant="neutral"   />}
                        </div>
                    </div>
                </SectionCard>
            )}

            <div style={{
                background: C.white, borderRadius: "20px",
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
                padding: "20px 28px 24px",
            }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "18px" }}>
                    <div style={{ position: "absolute", left: "-28px", width: "18px", height: "18px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />
                    <div style={{ flex: 1, borderTop: `1.5px dashed ${C.tanBorder}` }} />
                    <div style={{ position: "absolute", right: "-28px", width: "18px", height: "18px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />
                </div>

                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, textAlign: "center", margin: "0 0 18px" }}>
                    Your decision
                </p>

                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "14px",
                    padding: "12px 18px", borderRadius: "999px",
                    background: `linear-gradient(180deg, #EAE4DF 0%, ${C.beigeLight} 40%, #d8d2cd 100%)`,
                    boxShadow: `0 6px 0 #bfb9b4, 0 10px 28px rgba(165,147,123,0.20), inset 0 1px 0 rgba(255,255,255,0.65)`,
                    border: `1px solid ${C.tanBorder}`,
                    width: "fit-content", margin: "0 auto",
                }}>
                    <ActionButton onClick={() => handleDecision("NO")}         disabled={actionTaken} ariaLabel="Pass"  size={50} colorScheme="pass">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="19" height="19">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </ActionButton>
                    <ActionButton onClick={() => handleDecision("SUPER_LIKE")} disabled={actionTaken} ariaLabel="Super" size={58} colorScheme="super">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </ActionButton>
                    <ActionButton onClick={() => handleDecision("YES")}        disabled={actionTaken} ariaLabel="Yes"   size={50} colorScheme="yes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </ActionButton>
                </div>

                {actionTaken && (
                    <p style={{ fontFamily: SANS, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, textAlign: "center", marginTop: "14px" }}>
                        Decision recorded — returning...
                    </p>
                )}
            </div>
        </div>
    );
}