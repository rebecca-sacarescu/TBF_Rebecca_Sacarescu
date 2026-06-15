const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
};
const SANS = "'DM Sans', sans-serif";

export default function CountdownBadge({ countdown }) {
    if (!countdown) return null;

    const { daysUntilStart, startsToday, alreadyStarted, label } = countdown;

    let bg, color, shadow;

    if (alreadyStarted) {
        bg     = `linear-gradient(180deg, #8a8484 0%, ${C.grayWarm} 100%)`;
        color  = C.beigeLight;
        shadow = `0 3px 0 ${C.dark}`;
    } else if (startsToday || daysUntilStart === 0) {
        bg     = `linear-gradient(180deg, #c4b8d9 0%, ${C.lavender} 100%)`;
        color  = "#2d2040";
        shadow = `0 3px 0 #7d6a9e`;
    } else if (daysUntilStart <= 3) {
        bg     = `linear-gradient(180deg, ${C.sand} 0%, #d4a96a 100%)`;
        color  = "#3d2800";
        shadow = `0 3px 0 #8a6e3a`;
    } else {
        bg     = `linear-gradient(180deg, #b8ac9e 0%, ${C.tan} 100%)`;
        color  = C.beigeLight;
        shadow = `0 3px 0 #7a6a5a`;
    }

    const text = label || (
        alreadyStarted ? "Underway" :
            startsToday    ? "Starts today" :
                daysUntilStart === 1 ? "Tomorrow" :
                    `${daysUntilStart}d away`
    );

    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 10px", borderRadius: "999px",
            fontFamily: SANS, fontWeight: 700, fontSize: "10px",
            letterSpacing: "0.06em", whiteSpace: "nowrap",
            background: bg, color,
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: shadow,
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            {text}
        </div>
    );
}