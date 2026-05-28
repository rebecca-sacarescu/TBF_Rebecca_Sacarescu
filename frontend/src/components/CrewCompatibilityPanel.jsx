import { useState, useEffect } from "react";
import { getCrewCompatibility } from "../services/tripsApi";

const C = {
    beigeLight:     "#E9E3DE",
    beigeMid:       "#faf8f6",
    tan:            "#A5937B",
    tanBorder:      "rgba(165,147,123,0.25)",
    grayWarm:       "#666161",
    dark:           "#3a3737",
    lavender:       "#AF9AC9",
    lavenderBg:     "rgba(175,154,201,0.15)",
    lavenderBorder: "rgba(175,154,201,0.32)",
    white:          "#ffffff",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

function scoreColor(score) {
    if (score >= 75) return "#2e6b4f";
    if (score >= 50) return "#7a6200";
    return C.grayWarm;
}

function scoreBg(score) {
    if (score >= 75) return "rgba(46,107,79,0.12)";
    if (score >= 50) return "rgba(227,196,155,0.20)";
    return "rgba(165,147,123,0.10)";
}

function scoreBorder(score) {
    if (score >= 75) return "rgba(46,107,79,0.28)";
    if (score >= 50) return "rgba(165,147,123,0.40)";
    return C.tanBorder;
}

function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0", fontFamily: SANS }}>
            <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: C.grayWarm, borderRightColor: C.lavender,
                animation: "spin 0.9s linear infinite", flexShrink: 0,
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ fontSize: "11px", fontWeight: 600, color: C.tan, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                Computing crew fit...
            </p>
        </div>
    );
}

function ScoreBar({ label, score, icon }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 120);
        return () => clearTimeout(t);
    }, []);

    const fg = scoreColor(score);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {icon}
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.grayWarm }}>
                        {label}
                    </span>
                </div>
                <span style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 700, color: fg, minWidth: "36px", textAlign: "right" }}>
                    {score}%
                </span>
            </div>
            <div style={{ height: "6px", borderRadius: "999px", background: "rgba(165,147,123,0.18)", overflow: "hidden" }}>
                <div style={{
                    height: "100%", borderRadius: "999px",
                    background: score >= 75
                        ? "linear-gradient(to right, #3a8f66, #2e6b4f)"
                        : score >= 50
                            ? "linear-gradient(to right, #c4a040, #7a6200)"
                            : `linear-gradient(to right, ${C.tan}, ${C.grayWarm})`,
                    width: animated ? `${score}%` : "0%",
                    transition: "width 0.70s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }} />
            </div>
        </div>
    );
}

function HighlightBadge({ text }) {
    const isWarning = text.toLowerCase().startsWith("different");
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 14px", borderRadius: "12px",
            background: isWarning ? "rgba(165,147,123,0.10)" : C.lavenderBg,
            border: `1px solid ${isWarning ? C.tanBorder : C.lavenderBorder}`,
        }}>
            <div style={{
                width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isWarning ? "rgba(165,147,123,0.20)" : "rgba(175,154,201,0.28)",
            }}>
                {isWarning ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.tan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <circle cx="12" cy="17" r="0.5" fill={C.tan}/>
                        <path d="m10.29 3.86-8.19 14.2A1 1 0 0 0 3 20h18a1 1 0 0 0 .88-1.47L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.lavender} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                )}
            </div>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "12px", color: isWarning ? C.grayWarm : "#3a2d4a", lineHeight: 1.3 }}>
                {text}
            </span>
        </div>
    );
}

function GaugeSvg({ score }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, []);

    const r       = 52;
    const cx      = 68;
    const cy      = 68;
    const circ    = 2 * Math.PI * r;
    const dashArr = circ * 0.75;
    const dashOff = animated ? dashArr * (1 - score / 100) : dashArr;
    const fg      = scoreColor(score);

    return (
        <svg width="136" height="100" viewBox="0 0 136 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
                cx={cx} cy={cy} r={r}
                stroke="rgba(165,147,123,0.18)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dashArr} ${circ}`}
                strokeDashoffset={0}
                transform={`rotate(135 ${cx} ${cy})`}
                fill="none"
            />
            <circle
                cx={cx} cy={cy} r={r}
                stroke={fg}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dashArr} ${circ}`}
                strokeDashoffset={dashOff}
                transform={`rotate(135 ${cx} ${cy})`}
                fill="none"
                style={{ transition: "stroke-dashoffset 0.90s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
            <text x={cx} y={cy - 4} textAnchor="middle" fontFamily={SERIF} fontSize="22" fontWeight="800" fill={fg}>
                {score}%
            </text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontFamily={SANS} fontSize="8" fontWeight="700" fill={C.tan} letterSpacing="1.5">
                CREW MATCH
            </text>
        </svg>
    );
}

const SCORE_ROWS = [
    {
        key: "budgetScore",
        label: "Budget",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={C.tan}>
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
        ),
    },
    {
        key: "planningScore",
        label: "Travel Pace",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={C.tan}>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
        ),
    },
    {
        key: "socialScore",
        label: "Social Energy",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={C.tan}>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
        ),
    },
    {
        key: "interestScore",
        label: "Shared Interests",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={C.tan}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        ),
    },
    {
        key: "diversityScore",
        label: "Crew Diversity",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={C.tan}>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
            </svg>
        ),
    },
];

export default function CrewCompatibilityPanel({ tripId }) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!tripId) return;
        let cancelled = false;
        setLoading(true); setError(null); setVisible(false);

        getCrewCompatibility(tripId)
            .then((d) => {
                if (cancelled) return;
                setData(d);
                setTimeout(() => { if (!cancelled) setVisible(true); }, 60);
            })
            .catch((err) => { if (cancelled) return; setError(err.message ?? "Failed to load crew compatibility"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [tripId]);

    return (
        <section style={{
            background: C.white,
            borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            padding: "24px 28px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.40s ease, transform 0.40s ease",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: SERIF, fontSize: "20px", color: C.grayWarm, margin: 0, letterSpacing: "-0.01em" }}>
                    Your Crew Fit
                </h2>
                <div style={{ display: "flex", gap: "2px", opacity: 0.16 }}>
                    {[0.5, 1, 0.5, 2, 0.5, 1.5, 1, 0.5, 2].map((w, i) => (
                        <div key={i} style={{ background: C.grayWarm, width: `${w * 3}px`, height: "14px", borderRadius: "1px" }} />
                    ))}
                </div>
            </div>

            {loading && <Spinner />}

            {!loading && error && (
                <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>{error}</p>
            )}

            {!loading && !error && data && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
                        <div style={{ flexShrink: 0 }}>
                            <GaugeSvg score={data.overallScore} />
                        </div>
                        <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {SCORE_ROWS.map(({ key, label, icon }) => (
                                <ScoreBar key={key} label={label} score={data[key] ?? 0} icon={icon} />
                            ))}
                        </div>
                    </div>

                    {data.highlights?.length > 0 && (
                        <div>
                            <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 10px" }}>
                                Compatibility Signals
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
                                {data.highlights.map((h) => (
                                    <HighlightBadge key={h} text={h} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}