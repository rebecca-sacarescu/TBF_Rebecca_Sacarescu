// CrewInsights.jsx — new component
// Fetches and displays crew dynamics for a trip.
// Fade-in animation on mount.

import { useState, useEffect } from "react";
import { getCrewInsights } from "../services/tripsApi";

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

const BUDGET_LABELS    = { BUDGET_FRIENDLY: "Budget-friendly", MODERATE: "Moderate", LUXURY: "Luxury" };
const PLANNING_LABELS  = { SPONTANEOUS: "Spontaneous", FLEXIBLE: "Flexible", STRICT_ITINERARY: "Strict Itinerary" };
const BATTERY_LABELS   = { INTROVERT: "Introvert", AMBIVERT: "Ambivert", EXTROVERT: "Extrovert" };

function Pill({ label, count, variant = "activity" }) {
    const styles = {
        language: { background: "rgba(175,154,201,0.18)", color: "#3a2d4a", border: "1px solid rgba(175,154,201,0.35)" },
        activity: { background: "rgba(165,147,123,0.14)", color: C.grayWarm, border: `1px solid rgba(165,147,123,0.28)` },
    };
    const s = styles[variant] ?? styles.activity;
    return (
        <span style={{ ...s, display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "999px", fontFamily: SANS, fontWeight: 600, fontSize: "12px", whiteSpace: "nowrap" }}>
            {label}
            {count != null && <span style={{ fontWeight: 400, opacity: 0.65, fontSize: "11px" }}>({count})</span>}
        </span>
    );
}

function DnaChip({ label, sub }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderRadius: "14px", background: C.beigeMid, border: `1px solid ${C.tanBorder}`, boxShadow: `0 2px 0 #d4cec9` }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.16em", color: C.tan }}>{sub}</span>
            <span style={{ fontFamily: SERIF, fontSize: "15px", color: C.grayWarm, lineHeight: 1.1 }}>{label}</span>
        </div>
    );
}

function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0", fontFamily: SANS }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.grayWarm, borderRightColor: C.lavender, animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: "11px", fontWeight: 600, color: C.tan, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                Analysing crew dynamics...
            </p>
        </div>
    );
}

/**
 * @param {{ tripId: number }} props
 */
export default function CrewInsights({ tripId }) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!tripId) return;
        let cancelled = false;
        setLoading(true); setError(null); setVisible(false);

        getCrewInsights(tripId)
            .then((d) => {
                if (cancelled) return;
                setData(d);
                setTimeout(() => { if (!cancelled) setVisible(true); }, 60);
            })
            .catch((err) => { if (cancelled) return; setError(err.message ?? "Failed to load crew insights"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [tripId]);

    return (
        <section style={{
            background: C.white, borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            padding: "24px 28px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.40s ease, transform 0.40s ease",
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: 0, letterSpacing: "-0.01em" }}>
                    Crew Dynamics
                </h2>
                <div style={{ display: "flex", gap: "2px", opacity: 0.16 }}>
                    {[0.5,1,0.5,2,0.5,1.5,1,0.5,2].map((w, i) => (
                        <div key={i} style={{ background: C.grayWarm, width: `${w*3}px`, height: "14px", borderRadius: "1px" }} />
                    ))}
                </div>
            </div>

            {loading && <Spinner />}

            {!loading && error && (
                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>{error}</p>
            )}

            {!loading && !error && data && (
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

                    {/* Group vibe */}
                    {data.groupVibe && (
                        <div style={{ padding: "16px 18px", borderRadius: "14px", background: C.beigeMid, border: `1px solid ${C.tanBorder}`, boxShadow: `0 2px 0 #d4cec9` }}>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 6px" }}>Group Vibe</p>
                            <p style={{ fontFamily: SERIF, fontSize: "clamp(1rem,2.5vw,1.25rem)", color: C.grayWarm, margin: 0, lineHeight: 1.35, letterSpacing: "-0.01em", fontStyle: "italic" }}>
                                "{data.groupVibe}"
                            </p>
                        </div>
                    )}

                    {/* DNA chips */}
                    {(data.dominantBudget || data.dominantPlanningStyle || data.dominantSocialBattery) && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                            {data.dominantBudget        && <DnaChip label={BUDGET_LABELS[data.dominantBudget]        ?? data.dominantBudget}        sub="Budget" />}
                            {data.dominantPlanningStyle && <DnaChip label={PLANNING_LABELS[data.dominantPlanningStyle] ?? data.dominantPlanningStyle} sub="Planning" />}
                            {data.dominantSocialBattery && <DnaChip label={BATTERY_LABELS[data.dominantSocialBattery]  ?? data.dominantSocialBattery}  sub="Social Energy" />}
                        </div>
                    )}

                    {/* Insights list */}
                    {data.insights?.length > 0 && (
                        <div>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 10px" }}>Insights</p>
                            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                                {data.insights.map((insight, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.tan, flexShrink: 0, marginTop: "6px", opacity: 0.70 }} />
                                        <span style={{ fontFamily: SANS, fontSize: "13px", color: C.grayWarm, lineHeight: 1.55 }}>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Languages + Activities */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
                        {data.topLanguages?.length > 0 && (
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 10px" }}>Shared Languages</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                                    {data.topLanguages.map((l) => <Pill key={l.name} label={l.name} count={l.count} variant="language" />)}
                                </div>
                            </div>
                        )}
                        {data.topActivities?.length > 0 && (
                            <div>
                                <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 10px" }}>Shared Activities</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                                    {data.topActivities.map((a) => <Pill key={a.name} label={a.name} count={a.count} variant="activity" />)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}