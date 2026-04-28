// ChipSelector.jsx — redesigned to match new palette
// Zero functional changes — same props interface as before.

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.30)",
    sand:       "#E3C49B",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
};

const SANS = "'DM Sans', sans-serif";

export default function ChipSelector({ label, options = [], selected = [], onChange }) {
    const toggle = (value) => {
        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
        onChange(next);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{
                    fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                    textTransform: "uppercase", letterSpacing: "0.16em",
                    color: C.tan, margin: 0,
                }}>
                    {label}
                </p>
                {selected.length > 0 && (
                    <span style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                        color: C.lavender, letterSpacing: "0.06em",
                    }}>
                        {selected.length} selected
                    </span>
                )}
            </div>

            {/* Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {options.map((opt) => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "7px 14px", borderRadius: "999px",
                                fontFamily: SANS, fontWeight: 600, fontSize: "12px",
                                letterSpacing: "0.02em", cursor: "pointer",
                                transition: "all 0.18s ease", outline: "none",
                                border: isSelected ? "none" : `1.5px solid ${C.tanBorder}`,
                                background: isSelected
                                    ? `linear-gradient(135deg, ${C.lavender} 0%, #9a88b8 100%)`
                                    : C.beigeMid,
                                color: isSelected ? "#2d2040" : C.grayWarm,
                                boxShadow: isSelected
                                    ? `0 3px 0 #7d6a9e, 0 5px 12px rgba(175,154,201,0.28)`
                                    : `0 2px 0 #d4cec9`,
                                transform: "translateY(0)",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.borderColor = C.tan;
                                    e.currentTarget.style.boxShadow = `0 3px 0 #bfb9b4, 0 4px 10px rgba(165,147,123,0.18)`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.borderColor = C.tanBorder;
                                    e.currentTarget.style.boxShadow = `0 2px 0 #d4cec9`;
                                }
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.transform = "translateY(2px)";
                                e.currentTarget.style.boxShadow = isSelected
                                    ? `0 1px 0 #7d6a9e`
                                    : `0 1px 0 #bfb9b4`;
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = isSelected
                                    ? `0 3px 0 #7d6a9e, 0 5px 12px rgba(175,154,201,0.28)`
                                    : `0 2px 0 #d4cec9`;
                            }}
                        >
                            {isSelected && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2d2040" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}