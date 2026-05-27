// TripRoomPage.jsx
// UPDATED: Added AiTripPlanPanel below TripChatPanel.
// Added WebSocket subscription for /topic/trips/{tripId}/ai-plan
// to receive real-time plan notifications from other crew members.

import { useState, useEffect, useRef } from "react";
import { getMyCreatedTrips, getMyJoinedTrips } from "../services/tripsApi";
import CrewInsights from "../components/CrewInsights";
import TripChatPanel from "../components/TripChatPanel";
import AiTripPlanPanel from "../components/AiTripPlanPanel";
import TokenService from "../services/tokenService";

// SockJS + STOMP — same libs already used by TripChatPanel
// We reuse the existing WebSocket infrastructure pattern.
import { connectTripChatSocket } from "../services/tripChatSocket";

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
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

const TRIP_TYPE_LABELS = {
    CITY_BREAK: "City Break", ROAD_TRIP: "Road Trip", BEACH_ESCAPE: "Beach Escape",
    HIKING_NATURE: "Hiking", CULTURE_FOOD: "Culture & Food", BACKPACKING: "Backpacking",
};
const BUDGET_LABELS = { BUDGET_FRIENDLY: "Budget", MODERATE: "Moderate", LUXURY: "Luxury" };

function formatDate(d) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
}

function getInitials(name = "") {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function isTripChatReadonly(trip) {
    if (!trip) return true;
    const nonActiveStatuses = ["CLOSED", "CANCELLED", "EXPIRED"];
    if (nonActiveStatuses.includes(trip.status)) return true;
    if (trip.endDate) {
        const end = new Date(trip.endDate);
        end.setHours(23, 59, 59, 999);
        if (end < new Date()) return true;
    }
    return false;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ label = "Loading..." }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "80px 0", fontFamily: SANS }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.grayWarm, borderRightColor: C.lavender, animation: "spin 0.9s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: "10px", fontWeight: 600, color: C.tan, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0 }}>{label}</p>
        </div>
    );
}

// ─── Member card ──────────────────────────────────────────────────────────────

function MemberCard({ member, onViewProfile }) {
    const { fullName = "", profilePictureUrl, role, userId } = member;
    const inits   = getInitials(fullName);
    const hasImg  = !!profilePictureUrl;
    const isOwner = role === "OWNER";
    const clickable = !!onViewProfile && !!userId;

    return (
        <div
            onClick={clickable ? () => onViewProfile(userId) : undefined}
            style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                padding: "18px 14px", borderRadius: "16px",
                background: C.beigeMid,
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 3px 0 #d4cec9`,
                transition: "box-shadow 0.18s ease, transform 0.18s ease",
                cursor: clickable ? "pointer" : "default",
                textAlign: "center",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 6px 0 #bfb9b4, 0 8px 20px rgba(165,147,123,0.14)`;
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 3px 0 #d4cec9`;
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{ position: "relative" }}>
                <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    border: isOwner ? `2.5px solid ${C.lavender}` : `2px solid ${C.beigeLight}`,
                    boxShadow: isOwner ? `0 0 0 1px rgba(175,154,201,0.40), 0 3px 8px rgba(58,55,55,0.16)` : `0 3px 8px rgba(58,55,55,0.12)`,
                    background: `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)`,
                    overflow: "hidden",
                }}>
                    {hasImg ? (
                        <img src={profilePictureUrl} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: SERIF, fontSize: "1.1rem", color: C.beigeLight, opacity: 0.55 }}>{inits}</span>
                        </div>
                    )}
                </div>
                {isOwner && (
                    <div style={{
                        position: "absolute", bottom: "-3px", right: "-3px",
                        padding: "3px 6px", borderRadius: "999px",
                        fontFamily: SANS, fontWeight: 700, fontSize: "7px",
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        background: `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`,
                        color: "#2d2040", border: `2px solid ${C.white}`,
                        boxShadow: `0 2px 0 #7d6a9e`,
                    }}>
                        Owner
                    </div>
                )}
            </div>
            <div>
                <p style={{ fontFamily: SERIF, fontSize: "14px", color: C.grayWarm, margin: "0 0 2px", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{fullName}</p>
                <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.10em", color: C.tan, opacity: 0.70 }}>
                    {isOwner ? "Organiser" : "Crew"}
                </span>
                {clickable && (
                    <p style={{ fontFamily: SANS, fontSize: "9px", color: C.lavender, margin: "4px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        View profile
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Trip selector pill ───────────────────────────────────────────────────────

function TripPill({ trip, isSelected, onClick }) {
    return (
        <button onClick={onClick}
                style={{
                    display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "2px",
                    padding: "10px 16px", borderRadius: "14px", fontFamily: SANS, cursor: "pointer", flexShrink: 0,
                    border: isSelected ? "none" : `1.5px solid ${C.tanBorder}`,
                    background: isSelected
                        ? `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`
                        : C.beigeMid,
                    color: isSelected ? C.beigeLight : C.grayWarm,
                    boxShadow: isSelected ? `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)` : `0 2px 0 #d4cec9`,
                    transform: "translateY(0)", transition: "all 0.15s ease",
                    textAlign: "left", whiteSpace: "nowrap",
                }}
                onMouseDown={(e) => { if (isSelected) { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; } }}
                onMouseUp={(e)   => { if (isSelected) { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`; } }}
        >
            <span style={{ fontWeight: 700, fontSize: "12px", letterSpacing: "-0.01em" }}>{trip.destinationCity}</span>
            <span style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", opacity: isSelected ? 0.65 : 0.55 }}>
                {TRIP_TYPE_LABELS[trip.tripType] || trip.tripType}
            </span>
        </button>
    );
}

// ─── TripRoomPage ─────────────────────────────────────────────────────────────

/**
 * @param {{ onNavigate: (page:string)=>void, initialTripId?: number, onViewProfile?: (userId:number)=>void, currentUserId?: number|null }} props
 */
export default function TripRoomPage({ onNavigate, initialTripId, onViewProfile, currentUserId = null }) {
    const [allTrips,     setAllTrips]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState(null);
    const [selectedTrip, setSelectedTrip] = useState(null);

    // Holds a plan object pushed via WebSocket when another member regenerates
    const [externalPlan, setExternalPlan] = useState(null);

    // WebSocket ref for AI plan topic subscription
    const aiPlanSocketRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true); setError(null);

        Promise.all([getMyCreatedTrips(), getMyJoinedTrips()])
            .then(([created, joined]) => {
                if (cancelled) return;
                const all = [...(Array.isArray(created) ? created : []), ...(Array.isArray(joined) ? joined : [])];
                setAllTrips(all);
                if (initialTripId) {
                    const match = all.find((t) => t.tripId === initialTripId);
                    if (match) { setSelectedTrip(match); return; }
                }
                if (all.length > 0) setSelectedTrip(all[0]);
            })
            .catch((err) => { if (!cancelled) setError(err.message ?? "Failed to load trips"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [initialTripId]);

    // ── Subscribe to AI plan WebSocket topic when trip changes ──────────────
    useEffect(() => {
        if (!selectedTrip?.tripId) return;

        const token = TokenService.getToken();
        if (!token) return;

        // Reset external plan when switching trips
        setExternalPlan(null);

        // Connect to /topic/trips/{tripId}/ai-plan
        // We reuse the tripChatSocket pattern but subscribe to a different topic.
        // connectTripChatSocket already sets up SockJS + STOMP; we hijack its
        // onMessage for the AI plan topic by passing a custom topic override.
        // If your tripChatSocket does not support topic override, use the
        // pattern below with a direct STOMP subscription instead.
        const { disconnect } = connectTripChatSocket({
            tripId:    selectedTrip.tripId,
            token,
            topic:     `/topic/trips/${selectedTrip.tripId}/ai-plan`,
            onMessage: (notification) => {
                // notification = { tripId, message, plan }
                if (notification?.plan) {
                    setExternalPlan(notification);
                }
            },
            onConnect: () => {},
            onError:   () => {},
        });

        aiPlanSocketRef.current = { disconnect };

        return () => {
            disconnect?.();
            aiPlanSocketRef.current = null;
        };
    }, [selectedTrip?.tripId]);

    const trip = selectedTrip;

    if (loading) return <Spinner label="Loading your crew rooms..." />;

    if (error) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "60px 0", textAlign: "center", fontFamily: SANS }}>
                <p style={{ fontSize: "14px", color: C.tan, margin: 0 }}>{error}</p>
                <button onClick={() => onNavigate?.("my-trips")}
                        style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12px", color: C.beigeLight, background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 100%)`, border: "none", borderRadius: "999px", padding: "11px 22px", cursor: "pointer", boxShadow: `0 4px 0 ${C.dark}`, letterSpacing: "0.06em" }}>
                    Back to My Trips
                </button>
            </div>
        );
    }

    if (allTrips.length === 0) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "60px 24px", textAlign: "center", fontFamily: SANS, background: C.white, borderRadius: "20px", border: `1.5px dashed ${C.tanBorder}` }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(175,154,201,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={C.grayWarm} style={{ opacity: 0.45 }}>
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                </div>
                <div>
                    <p style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: "0 0 6px" }}>No crew rooms yet</p>
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0, lineHeight: 1.6 }}>Create or join a trip to access your crew room.</p>
                </div>
                <button onClick={() => onNavigate?.("open-trips")}
                        style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12px", color: C.beigeLight, background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 100%)`, border: "none", borderRadius: "999px", padding: "11px 22px", cursor: "pointer", boxShadow: `0 4px 0 ${C.dark}`, letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    Explore Open Trips
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "40px", fontFamily: SANS }}>

            {/* ── Trip selector ──────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
                {allTrips.map((t) => (
                    <TripPill key={t.tripId} trip={t} isSelected={selectedTrip?.tripId === t.tripId} onClick={() => setSelectedTrip(t)} />
                ))}
            </div>

            {trip && (
                <>
                    {/* ── Hero header ────────────────────────────────────────── */}
                    <section style={{ background: C.white, borderRadius: "20px", border: `1px solid ${C.tanBorder}`, boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`, overflow: "hidden" }}>
                        <div style={{ height: "120px", background: `linear-gradient(135deg, ${C.grayWarm} 0%, #575353 40%, #4d4949 100%)`, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, rgba(58,55,55,0.55) 100%)` }} />
                            <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill={C.beigeLight}>
                                    <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>
                                </svg>
                            </div>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />
                            <button onClick={() => onNavigate?.("my-trips")}
                                    style={{ position: "absolute", top: "12px", left: "14px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "999px", fontFamily: SANS, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.10em", background: "rgba(233,227,222,0.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(233,227,222,0.22)", color: C.beigeLight, cursor: "pointer" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.24)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(233,227,222,0.14)"; }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m15 18-6-6 6-6"/>
                                </svg>
                                My Trips
                            </button>
                        </div>

                        <div style={{ padding: "20px 24px 24px", display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "16px", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 4px" }}>Crew Room</p>
                                <h1 style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: C.grayWarm, margin: "0 0 4px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                                    {trip.destinationCity}
                                    {trip.destinationCountry && <span style={{ color: C.tan, fontWeight: 400 }}>, {trip.destinationCountry}</span>}
                                </h1>
                                {trip.title && <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: "0 0 10px" }}>{trip.title}</p>}
                                {trip.countdown && (
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: "6px",
                                        padding: "6px 14px", borderRadius: "999px",
                                        fontFamily: SANS, fontWeight: 700, fontSize: "12px", letterSpacing: "0.04em",
                                        background: trip.countdown.alreadyStarted
                                            ? `linear-gradient(180deg, #8a8484 0%, ${C.grayWarm} 100%)`
                                            : trip.countdown.startsToday
                                                ? `linear-gradient(180deg, #c4b8d9 0%, ${C.lavender} 100%)`
                                                : `linear-gradient(180deg, ${C.sand} 0%, #d4a96a 100%)`,
                                        color: trip.countdown.alreadyStarted ? C.beigeLight : trip.countdown.startsToday ? "#2d2040" : "#3d2800",
                                        boxShadow: trip.countdown.alreadyStarted ? `0 3px 0 ${C.dark}` : trip.countdown.startsToday ? `0 3px 0 #7d6a9e` : `0 3px 0 #8a6e3a`,
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        {trip.countdown.label || `${trip.countdown.daysUntilStart} days away`}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                {[["Departure", formatDate(trip.startDate)], ["Return", formatDate(trip.endDate)], ["Budget", BUDGET_LABELS[trip.budget] || trip.budget], ["Crew", `${trip.currentMemberCount} / ${trip.targetGroupSize}`]].map(([label, value]) => (
                                    <div key={label}>
                                        <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan, margin: "0 0 2px" }}>{label}</p>
                                        <p style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, margin: 0, lineHeight: 1.1 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {trip.description && (
                            <div style={{ padding: "16px 24px 20px", borderTop: `1px solid ${C.tanBorder}` }}>
                                <div style={{ display: "flex", gap: "2px", marginBottom: "10px", opacity: 0.16 }}>
                                    {[0.5,1,0.5,2,0.5,1.5,1,0.5].map((w, i) => (
                                        <div key={i} style={{ background: C.grayWarm, width: `${w*3}px`, height: "14px", borderRadius: "1px" }} />
                                    ))}
                                </div>
                                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.grayWarm, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>
                                    "{trip.description}"
                                </p>
                            </div>
                        )}
                    </section>

                    {/* ── Crew members ───────────────────────────────────────── */}
                    <section style={{ background: C.white, borderRadius: "20px", border: `1px solid ${C.tanBorder}`, boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`, padding: "24px 28px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                            <h2 style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: 0, letterSpacing: "-0.01em" }}>Your Crew</h2>
                            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan }}>
                                {trip.currentMemberCount} / {trip.targetGroupSize} aboard
                            </span>
                        </div>

                        {trip.memberPreview?.length > 0 ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                                {trip.memberPreview.map((member, i) => (
                                    <MemberCard key={member.userId ?? i} member={member} onViewProfile={onViewProfile} />
                                ))}
                                {trip.spotsLeft > 0 && Array.from({ length: Math.min(trip.spotsLeft, 4) }).map((_, i) => (
                                    <div key={`empty-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "18px 14px", borderRadius: "16px", background: C.beigeMid, border: `1.5px dashed ${C.tanBorder}` }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: `1.5px dashed ${C.tanBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.tan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                        </div>
                                        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, opacity: 0.55 }}>Open Spot</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>Crew details not available yet.</p>
                        )}
                    </section>

                    {/* ── Crew Insights ──────────────────────────────────────── */}
                    <CrewInsights tripId={trip.tripId} />

                    {/* ── AI Trip Planner ────────────────────────────────────── */}
                    <AiTripPlanPanel
                        key={trip.tripId}
                        tripId={trip.tripId}
                        destinationCity={trip.destinationCity}
                        destinationCountry={trip.destinationCountry}
                        externalPlan={externalPlan}
                    />

                    {/* ── Trip Room Chat ─────────────────────────────────────── */}
                    <TripChatPanel
                        tripId={trip.tripId}
                        tripTitle={trip.title}
                        destinationCity={trip.destinationCity}
                        destinationCountry={trip.destinationCountry}
                        memberCount={trip.currentMemberCount}
                        readonly={isTripChatReadonly(trip)}
                        currentUserId={currentUserId}
                    />
                </>
            )}
        </div>
    );
}