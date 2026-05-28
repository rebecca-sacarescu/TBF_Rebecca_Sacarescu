import { useState, useEffect } from "react";
import { getCrewCompatibility } from "../services/tripsApi";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    white:      "#ffffff",
};
const SANS  = "'DM Sans', sans-serif";
const SERIF = "'DM Serif Display', serif";

function scoreColor(score) {
    if (score >= 75) return { fg: "#2e6b4f", bg: "rgba(46,107,79,0.12)", border: "rgba(46,107,79,0.28)" };
    if (score >= 50) return { fg: "#7a6200", bg: "rgba(227,196,155,0.22)", border: "rgba(165,147,123,0.40)" };
    return { fg: C.grayWarm, bg: "rgba(165,147,123,0.12)", border: C.tanBorder };
}

export default function CrewCompatibilityBadge({ tripId }) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!tripId) return;
        let cancelled = false;
        setLoading(true);
        setVisible(false);

        getCrewCompatibility(tripId)
            .then((d) => {
                if (cancelled) return;
                setData(d);
                setTimeout(() => { if (!cancelled) setVisible(true); }, 80);
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [tripId]);

    if (loading) {
        return (
            <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "999px",
                background: "rgba(165,147,123,0.10)",
                border: `1px solid ${C.tanBorder}`,
                fontFamily: SANS,
            }}>
                <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    border: "1.5px solid transparent",
                    borderTopColor: C.tan,
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.tan }}>
                    Analysing fit...
                </span>
            </div>
        );
    }

    if (!data) return null;

    const { overallScore, highlights = [] } = data;
    const col = scoreColor(overallScore);
    const topHighlights = highlights.slice(0, 2);

    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: "8px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 0.30s ease, transform 0.30s ease",
        }}>
            <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "6px 14px", borderRadius: "999px",
                background: col.bg,
                border: `1px solid ${col.border}`,
                alignSelf: "flex-start",
            }}>
                <span style={{
                    fontFamily: SERIF, fontSize: "16px", fontWeight: 800,
                    color: col.fg, lineHeight: 1,
                }}>
                    {overallScore}%
                </span>
                <span style={{
                    fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                    textTransform: "uppercase", letterSpacing: "0.14em",
                    color: col.fg, opacity: 0.80,
                }}>
                    crew match
                </span>
            </div>

            {topHighlights.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {topHighlights.map((h) => {
                        const isWarning = h.toLowerCase().startsWith("different");
                        return (
                            <span key={h} style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                padding: "3px 10px", borderRadius: "999px",
                                fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                                background: isWarning ? "rgba(165,147,123,0.12)" : "rgba(175,154,201,0.16)",
                                color: isWarning ? C.grayWarm : "#3a2d4a",
                                border: `1px solid ${isWarning ? C.tanBorder : "rgba(175,154,201,0.32)"}`,
                            }}>
                                <div style={{
                                    width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                                    background: isWarning ? C.tan : C.lavender,
                                }} />
                                {h}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}