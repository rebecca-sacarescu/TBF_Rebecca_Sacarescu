import { useState, useRef, useCallback, useEffect } from "react";
import { getFeed, postInteraction } from "../services/feedApi";
import { saveProfile, unsaveProfile } from "../services/savedProfilesApi";
import { postDiscoverEvent } from "../services/discoverApi";
import { BookmarkIcon } from "../components/Icons";

const SWIPE_THRESHOLD  = 75;
const EXIT_DISTANCE    = 680;
const EXIT_MS          = 380;
const DOUBLE_TAP_MS    = 300;
const ROTATION_MAX_DEG = 18;

const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    lavender:   "#AF9AC9",
    dark:       "#3a3737",
};

const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

const SOCIAL_BATTERY = { INTROVERT: "Introvert", AMBIVERT: "Ambivert", EXTROVERT: "Extrovert" };
const PLANNING_STYLE = { SPONTANEOUS: "Spontaneous", FLEXIBLE: "Flexible", STRICT_ITINERARY: "Planner" };
const BUDGET         = { BUDGET_FRIENDLY: "Budget", MODERATE: "Moderate", LUXURY: "Luxury" };

function initials(name = "") {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function Spinner({ label = "Loading..." }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "80px 0" }}>
            <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: C.grayWarm, borderRightColor: C.lavender,
                animation: "spin 0.9s linear infinite",
            }} />
            <p style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 600, color: C.tan, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>
                {label}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function Pill({ label, variant = "activity" }) {
    const styles = {
        dna:      { background: "rgba(175,154,201,0.22)", color: C.beigeLight, border: "1px solid rgba(175,154,201,0.45)" },
        activity: { background: "rgba(165,147,123,0.22)", color: C.beigeLight, border: "1px solid rgba(165,147,123,0.38)" },
        language: { background: "rgba(227,196,155,0.20)", color: "#E3C49B",    border: "1px solid rgba(227,196,155,0.38)" },
    };
    const s = styles[variant] ?? styles.activity;
    return (
        <span style={{
            ...s, display: "inline-flex", alignItems: "center",
            padding: "4px 11px", borderRadius: "999px",
            fontSize: "11px", fontWeight: 600, fontFamily: SANS,
            letterSpacing: "0.03em", whiteSpace: "nowrap",
            backdropFilter: "blur(6px)",
        }}>
            {label}
        </span>
    );
}

function EmptyFeed({ onNavigate }) {
    return (
        <div style={{
            width: "100%", height: "100%", borderRadius: "28px",
            background: "#fff", border: `1.5px dashed ${C.tan}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "20px", textAlign: "center", padding: "32px",
        }}>
            <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "rgba(175,154,201,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={C.grayWarm}>
                    <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                </svg>
            </div>
            <div>
                <p style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: "0 0 8px", lineHeight: 1.2 }}>
                    You've reviewed everyone
                </p>
                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, lineHeight: 1.6, margin: 0 }}>
                    New travelers join daily.<br />Check back soon.
                </p>
            </div>
            <button
                onClick={() => onNavigate?.("matches")}
                onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}, 0 2px 6px rgba(102,97,97,0.18)`; }}
                onMouseUp={(e)   => { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 16px rgba(102,97,97,0.28)`; }}
                style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: "13px", color: C.beigeLight,
                    border: "none", cursor: "pointer", borderRadius: "999px", padding: "12px 24px",
                    background: `linear-gradient(180deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                    boxShadow: `0 4px 0 ${C.dark}, 0 6px 16px rgba(102,97,97,0.28)`,
                    display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s ease",
                }}
            >
                View Matches
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
            </button>
        </div>
    );
}

function ErrorState({ message, onRetry }) {
    return (
        <div style={{
            width: "100%", height: "100%", borderRadius: "28px",
            background: "#fff", border: "1.5px dashed #ffdad6",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "16px", textAlign: "center", padding: "32px",
        }}>
            <p style={{ fontFamily: SANS, fontSize: "14px", color: C.tan, margin: 0 }}>{message}</p>
            <button
                onClick={onRetry}
                onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; }}
                onMouseUp={(e)   => { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 16px rgba(102,97,97,0.28)`; }}
                style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: "12px", color: C.beigeLight,
                    border: "none", cursor: "pointer", borderRadius: "999px", padding: "11px 22px",
                    background: `linear-gradient(180deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                    boxShadow: `0 4px 0 ${C.dark}, 0 6px 16px rgba(102,97,97,0.28)`,
                    transition: "all 0.15s ease",
                }}
            >
                Try again
            </button>
        </div>
    );
}

function ProgressDots({ total, current }) {
    const count  = Math.min(total, 5);
    const active = current % count;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} style={{
                    width: i === active ? "22px" : "6px",
                    height: "6px", borderRadius: "999px",
                    background: i === active ? C.grayWarm : C.tan,
                    opacity: i === active ? 1 : 0.4,
                    transition: "all 0.3s ease",
                }} />
            ))}
        </div>
    );
}

function ProfileCard({
                         profile, dragX, isDragging, isExiting, exitDirection,
                         onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
                         onToggleSave, onViewProfile,
                         isSaved = false, isSaveLoading = false, isBack = false,
                     }) {
    const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
    const rotation = (dragX / EXIT_DISTANCE) * ROTATION_MAX_DEG;

    let transform, transition;
    if (isBack) {
        transform  = `scale(${0.93 + progress * 0.07})`;
        transition = "transform 0.15s ease";
    } else if (isExiting) {
        if (exitDirection === "right")      transform = `translateX(${EXIT_DISTANCE}px) rotate(${ROTATION_MAX_DEG}deg)`;
        else if (exitDirection === "left")  transform = `translateX(-${EXIT_DISTANCE}px) rotate(-${ROTATION_MAX_DEG}deg)`;
        else                                transform = `translateY(-${EXIT_DISTANCE}px) scale(1.04)`;
        transition = `transform ${EXIT_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    } else {
        transform  = `translateX(${dragX}px) rotate(${rotation}deg)`;
        transition = isDragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)";
    }

    const yesOp   = !isBack && dragX > 20  ? Math.min((dragX  - 20) / (SWIPE_THRESHOLD - 20), 1) : 0;
    const noOp    = !isBack && dragX < -20 ? Math.min((-dragX - 20) / (SWIPE_THRESHOLD - 20), 1) : 0;
    const superOn = !isBack && isExiting && exitDirection === "super";

    const {
        profilePictureUrl, fullName = "", age, currentLocation, bio,
        socialBattery, planningStyle, budget,
        activities = [], languages = [], lookingForWhat = [],
        compatibilityScore,
    } = profile;

    const inits      = initials(fullName);
    const hasImg     = !!profilePictureUrl;
    const shownActs  = activities.slice(0, 3);
    const extraCount = Math.max(0, activities.length - 3);
    const shownLangs = languages.slice(0, 2);
    const lookingFor = Array.isArray(lookingForWhat) ? lookingForWhat[0] : lookingForWhat;
    const showScore  = compatibilityScore != null && Number(compatibilityScore) > 0;
    const stopSwipe  = (e) => e.stopPropagation();

    return (
        <div
            className="absolute inset-0 select-none"
            style={{ transform, transition, cursor: isBack ? "default" : "grab", touchAction: "none" }}
            onPointerDown={isBack ? undefined : onPointerDown}
            onPointerMove={isBack ? undefined : onPointerMove}
            onPointerUp={isBack ? undefined : onPointerUp}
            onPointerCancel={isBack ? undefined : onPointerCancel}
        >
            <div style={{
                width: "100%", height: "100%", borderRadius: "28px",
                overflow: "hidden", position: "relative",
                background: C.grayWarm,
                boxShadow: isBack
                    ? `0 4px 0 ${C.dark}, 0 8px 24px rgba(58,55,55,0.14)`
                    : `0 6px 0 ${C.dark}, 0 16px 48px rgba(58,55,55,0.22), 0 6px 16px rgba(58,55,55,0.14)`,
            }}>

                {hasImg ? (
                    <img src={profilePictureUrl} alt={fullName} draggable={false}
                         style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                         onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                ) : (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: `linear-gradient(145deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                    }}>
                        <span style={{ fontFamily: SERIF, fontSize: "clamp(3rem,12vw,5.5rem)", color: C.beigeLight, opacity: 0.12, letterSpacing: "0.06em" }}>
                            {inits}
                        </span>
                    </div>
                )}

                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "linear-gradient(to top, rgba(58,55,55,0.96) 0%, rgba(58,55,55,0.55) 40%, rgba(58,55,55,0.08) 66%, transparent 100%)",
                }} />

                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: yesOp, display: "flex", alignItems: "flex-start", justifyContent: "flex-start", padding: "24px" }}>
                    <div style={{ fontFamily: SERIF, fontSize: "24px", color: "#7ec99a", border: "2.5px solid #7ec99a", background: "rgba(40,40,40,0.55)", backdropFilter: "blur(8px)", padding: "6px 16px", borderRadius: "12px", transform: "rotate(-10deg)" }}>
                        Yes
                    </div>
                </div>

                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: noOp, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: "24px" }}>
                    <div style={{ fontFamily: SERIF, fontSize: "24px", color: "#d4847a", border: "2.5px solid #d4847a", background: "rgba(40,40,40,0.55)", backdropFilter: "blur(8px)", padding: "6px 16px", borderRadius: "12px", transform: "rotate(10deg)" }}>
                        Pass
                    </div>
                </div>

                {superOn && (
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(175,154,201,0.10)" }}>
                        <div style={{ fontFamily: SERIF, fontSize: "24px", color: C.lavender, border: `2.5px solid ${C.lavender}`, background: "rgba(40,40,40,0.55)", backdropFilter: "blur(8px)", padding: "8px 20px", borderRadius: "12px" }}>
                            Super
                        </div>
                    </div>
                )}

                {showScore && !isBack && (
                    <div style={{
                        position: "absolute", top: "16px", right: "16px",
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "5px 12px", borderRadius: "999px",
                        background: "rgba(165,147,123,0.28)", backdropFilter: "blur(10px)",
                        border: "1px solid rgba(165,147,123,0.40)",
                        fontFamily: SANS, fontWeight: 700, fontSize: "12px",
                        color: C.sand, letterSpacing: "0.02em",
                    }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {compatibilityScore}%
                    </div>
                )}

                {!isBack && (
                    <button
                        type="button"
                        onPointerDown={stopSwipe} onPointerUp={stopSwipe}
                        onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
                        disabled={isSaveLoading}
                        aria-label={isSaved ? "Remove from saved" : "Save profile"}
                        style={{
                            position: "absolute", top: "16px", left: "16px",
                            width: "38px", height: "38px", borderRadius: "50%",
                            border: "none", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer",
                            opacity: isSaveLoading ? 0.6 : 1, transition: "all 0.2s ease",
                            background: isSaved ? C.lavender : "rgba(233,227,222,0.18)",
                            backdropFilter: "blur(10px)",
                            boxShadow: isSaved
                                ? `0 3px 0 rgba(130,110,160,0.55), 0 4px 12px rgba(175,154,201,0.30)`
                                : `0 2px 0 rgba(0,0,0,0.20), 0 4px 10px rgba(0,0,0,0.12)`,
                            color: isSaved ? "#3a2d4a" : C.beigeLight,
                        }}
                    >
                        <BookmarkIcon size={14} filled={isSaved} />
                    </button>
                )}

                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: "9px" }}>

                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "9px", minWidth: 0 }}>
                            <span style={{ fontFamily: SERIF, fontSize: "clamp(1.3rem,4vw,1.55rem)", color: C.beigeLight, letterSpacing: "-0.01em", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {fullName}
                            </span>
                            {age != null && (
                                <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "15px", color: "rgba(233,227,222,0.60)", flexShrink: 0 }}>
                                    {age}
                                </span>
                            )}
                        </div>
                        {!isBack && (
                            <button
                                type="button"
                                onPointerDown={stopSwipe} onPointerUp={stopSwipe}
                                onClick={(e) => { e.stopPropagation(); onViewProfile?.(); }}
                                style={{
                                    flexShrink: 0, display: "flex", alignItems: "center", gap: "5px",
                                    background: "rgba(233,227,222,0.14)", backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(233,227,222,0.25)", borderRadius: "999px",
                                    padding: "5px 13px", cursor: "pointer", color: C.beigeLight,
                                    fontFamily: SANS, fontWeight: 600, fontSize: "11px",
                                    letterSpacing: "0.04em", transition: "background 0.18s ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.24)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.14)"; }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Profile
                            </button>
                        )}
                    </div>

                    {currentLocation && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="rgba(233,227,222,0.50)">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", color: "rgba(233,227,222,0.50)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                {currentLocation}
                            </span>
                        </div>
                    )}

                    {bio && (
                        <p style={{
                            fontFamily: SANS, fontWeight: 400, fontSize: "13px",
                            color: "rgba(233,227,222,0.68)", lineHeight: 1.55, margin: 0,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                            {bio}
                        </p>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        {socialBattery && SOCIAL_BATTERY[socialBattery] && <Pill label={SOCIAL_BATTERY[socialBattery]} variant="dna" />}
                        {planningStyle  && PLANNING_STYLE[planningStyle]  && <Pill label={PLANNING_STYLE[planningStyle]}  variant="dna" />}
                        {budget         && BUDGET[budget]                  && <Pill label={BUDGET[budget]}                 variant="dna" />}
                        {shownActs.map((a) => <Pill key={a} label={a} variant="activity" />)}
                        {extraCount > 0 && <span style={{ fontFamily: SANS, fontSize: "11px", color: "rgba(233,227,222,0.40)", fontWeight: 600 }}>+{extraCount}</span>}
                        {shownLangs.map((l) => <Pill key={l} label={l} variant="language" />)}
                        {lookingFor && <Pill label={lookingFor} variant="activity" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ onClick, disabled, ariaLabel, size = 50, children, colorScheme = "neutral" }) {
    const schemes = {
        neutral: { bg: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`, shadow: `0 5px 0 ${C.dark}, 0 8px 20px rgba(58,55,55,0.28)`, shadowDown: `0 1px 0 ${C.dark}, 0 2px 6px rgba(58,55,55,0.18)`, color: C.beigeLight, border: "1px solid rgba(255,255,255,0.10)" },
        pass:    { bg: `linear-gradient(180deg, #c4847a 0%, #b07068 50%, #966059 100%)`,         shadow: `0 5px 0 #7a4d47, 0 8px 20px rgba(176,112,104,0.30)`,   shadowDown: `0 1px 0 #7a4d47, 0 2px 6px rgba(176,112,104,0.18)`,   color: "#fff5f4",    border: "1px solid rgba(255,255,255,0.12)" },
        super:   { bg: `linear-gradient(180deg, #c4b8d9 0%, ${C.lavender} 50%, #9a88b8 100%)`,  shadow: `0 5px 0 #7d6a9e, 0 8px 20px rgba(175,154,201,0.32)`,   shadowDown: `0 1px 0 #7d6a9e, 0 2px 6px rgba(175,154,201,0.20)`,   color: "#2d2040",    border: "1px solid rgba(255,255,255,0.20)" },
        yes:     { bg: `linear-gradient(180deg, #9ecfb0 0%, #7eba95 50%, #68a47e 100%)`,         shadow: `0 5px 0 #4d8262, 0 8px 20px rgba(126,186,149,0.30)`,   shadowDown: `0 1px 0 #4d8262, 0 2px 6px rgba(126,186,149,0.18)`,   color: "#1a3326",    border: "1px solid rgba(255,255,255,0.18)" },
    };
    const s = schemes[colorScheme];

    const down = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(4px)"; e.currentTarget.style.boxShadow = s.shadowDown; } };
    const up   = (e) => { if (!disabled) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = s.shadow; } };

    return (
        <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}
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
    );
}

function ActionBar({ onPass, onSuper, onYes, disabled }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "12px 18px", borderRadius: "999px",
            background: `linear-gradient(180deg, #EAE4DF 0%, ${C.beigeLight} 40%, #d8d2cd 100%)`,
            boxShadow: `0 6px 0 #bfb9b4, 0 10px 28px rgba(165,147,123,0.22), inset 0 1px 0 rgba(255,255,255,0.70)`,
            border: "1px solid rgba(165,147,123,0.20)",
        }}>
            <ActionButton onClick={onPass}  disabled={disabled} ariaLabel="Pass"       size={50} colorScheme="pass">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="19" height="19">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </ActionButton>
            <ActionButton onClick={onSuper} disabled={disabled} ariaLabel="Super Like" size={58} colorScheme="super">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </ActionButton>
            <ActionButton onClick={onYes}   disabled={disabled} ariaLabel="Yes"        size={50} colorScheme="yes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </ActionButton>
        </div>
    );
}

export default function FeedPage({ onNavigate, onViewProfile }) {
    const [profiles, setProfiles]           = useState([]);
    const [currentIndex, setCurrentIndex]   = useState(0);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [dragX, setDragX]                 = useState(0);
    const [isDragging, setIsDragging]       = useState(false);
    const [isExiting, setIsExiting]         = useState(false);
    const [exitDirection, setExitDirection] = useState(null);
    const [isAnimating, setIsAnimating]     = useState(false);
    const [savedIds, setSavedIds]           = useState(new Set());
    const [savingIds, setSavingIds]         = useState(new Set());

    const dragStartX  = useRef(0);
    const lastTapTime = useRef(0);

    const fetchFeed = useCallback(async () => {
        setLoading(true); setError(null); setCurrentIndex(0);
        try { const data = await getFeed(); setProfiles(Array.isArray(data) ? data : []); }
        catch (err) { setError(err.message ?? "Failed to load feed"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchFeed(); }, [fetchFeed]);

    useEffect(() => {
        const handler = (e) => {
            if (isAnimating || loading || error) return;
            if (e.key === "ArrowRight") triggerDecision("right");
            if (e.key === "ArrowLeft")  triggerDecision("left");
            if (e.key === " ") { e.preventDefault(); triggerDecision("super"); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    });

    const triggerDecision = useCallback(async (direction) => {
        if (isAnimating || currentIndex >= profiles.length) return;
        const profile = profiles[currentIndex];
        const actionMap = { right: "YES", left: "NO", super: "SUPER_LIKE" };
        setIsAnimating(true); setIsExiting(true); setExitDirection(direction);
        postInteraction(profile.userId, actionMap[direction]).catch(() => {});
        if (direction === "left") setSavedIds((prev) => { const n = new Set(prev); n.delete(profile.userId); return n; });
        setTimeout(() => { setCurrentIndex((p) => p + 1); setIsExiting(false); setExitDirection(null); setDragX(0); setIsAnimating(false); }, EXIT_MS + 30);
    }, [isAnimating, currentIndex, profiles]);

    const handleToggleSave = useCallback(async (userId) => {
        if (savingIds.has(userId)) return;
        const isSaved = savedIds.has(userId);
        setSavedIds((p) => { const n = new Set(p); isSaved ? n.delete(userId) : n.add(userId); return n; });
        setSavingIds((p) => { const n = new Set(p); n.add(userId); return n; });
        try {
            if (isSaved) { await unsaveProfile(userId); postDiscoverEvent(userId, { eventType: "UNSAVE", surface: "FEED_CARD" }); }
            else         { await saveProfile(userId);   postDiscoverEvent(userId, { eventType: "SAVE",   surface: "FEED_CARD" }); }
        } catch {
            setSavedIds((p) => { const n = new Set(p); isSaved ? n.add(userId) : n.delete(userId); return n; });
        } finally {
            setSavingIds((p) => { const n = new Set(p); n.delete(userId); return n; });
        }
    }, [savedIds, savingIds]);

    const handleViewProfile = useCallback((userId) => {
        postDiscoverEvent(userId, { eventType: "CARD_CLICK", surface: "FEED_CARD" });
        if (onViewProfile) { onViewProfile(userId); return; }
        onNavigate?.("discover", { targetUserId: userId });
    }, [onNavigate, onViewProfile]);

    const onPointerDown = useCallback((e) => {
        if (isAnimating) return;
        const now = Date.now();
        if (now - lastTapTime.current < DOUBLE_TAP_MS) { lastTapTime.current = 0; triggerDecision("super"); return; }
        lastTapTime.current = now; dragStartX.current = e.clientX;
        setIsDragging(true); e.currentTarget.setPointerCapture(e.pointerId);
    }, [isAnimating, triggerDecision]);

    const onPointerMove   = useCallback((e) => { if (!isDragging) return; setDragX(e.clientX - dragStartX.current); }, [isDragging]);
    const onPointerUp     = useCallback(() => { if (!isDragging) return; setIsDragging(false); if (dragX > SWIPE_THRESHOLD) triggerDecision("right"); else if (dragX < -SWIPE_THRESHOLD) triggerDecision("left"); else setDragX(0); }, [isDragging, dragX, triggerDecision]);
    const onPointerCancel = useCallback(() => { setIsDragging(false); setDragX(0); }, []);

    const currentProfile = profiles[currentIndex];
    const nextProfile    = profiles[currentIndex + 1];
    const isFeedDone     = !loading && !error && !currentProfile;
    const hasContent     = !loading && !error && !!currentProfile;

    if (loading) return <Spinner label="Finding travelers..." />;

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", paddingTop: "24px", fontFamily: SANS }}>

                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.7rem,4vw,2.1rem)", color: C.grayWarm, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1 }}>
                        Discover
                    </h1>
                    <p style={{ fontFamily: SANS, fontWeight: 400, fontSize: "13px", color: C.tan, marginTop: "5px", letterSpacing: "0.02em" }}>
                        People worth traveling with
                    </p>
                </div>

                <div style={{ position: "relative", width: "100%", maxWidth: "400px", height: "clamp(500px, 68vh, 620px)", flexShrink: 0 }}>
                    {error ? (
                        <ErrorState message={error} onRetry={fetchFeed} />
                    ) : isFeedDone ? (
                        <EmptyFeed onNavigate={onNavigate} />
                    ) : (
                        <>
                            {nextProfile && (
                                <ProfileCard key={`back-${nextProfile.userId}`} profile={nextProfile}
                                             dragX={dragX} isDragging={isDragging} isExiting={false} exitDirection={null} isBack />
                            )}
                            <ProfileCard key={`card-${currentProfile.userId}`} profile={currentProfile}
                                         dragX={dragX} isDragging={isDragging} isExiting={isExiting} exitDirection={exitDirection}
                                         onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                                         onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
                                         isSaved={savedIds.has(currentProfile.userId)}
                                         isSaveLoading={savingIds.has(currentProfile.userId)}
                                         onToggleSave={() => handleToggleSave(currentProfile.userId)}
                                         onViewProfile={() => handleViewProfile(currentProfile.userId)}
                            />
                        </>
                    )}
                </div>

                {hasContent && <ActionBar onPass={() => triggerDecision("left")} onSuper={() => triggerDecision("super")} onYes={() => triggerDecision("right")} disabled={isAnimating} />}
                {hasContent && profiles.length > 1 && <ProgressDots total={profiles.length} current={currentIndex} />}
                {hasContent && (
                    <p style={{ fontFamily: SANS, fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, textAlign: "center", paddingBottom: "24px", opacity: 0.7 }}>
                        Swipe or tap · right = yes · left = pass · double tap = super
                    </p>
                )}
            </div>
        </>
    );
}