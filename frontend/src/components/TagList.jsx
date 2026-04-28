import { useState } from "react";

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

// Variant → pill style mapping — same variant keys as before
const VARIANT_STYLES = {
    default: {
        background: "rgba(165,147,123,0.14)",
        color:      C.grayWarm,
        border:     `1px solid rgba(165,147,123,0.28)`,
    },
    secondary: {
        background: "rgba(175,154,201,0.16)",
        color:      "#3a2d4a",
        border:     `1px solid rgba(175,154,201,0.32)`,
    },
    tertiary: {
        background: "rgba(227,196,155,0.22)",
        color:      "#5c3d00",
        border:     `1px solid rgba(227,196,155,0.40)`,
    },
    primary: {
        background: "rgba(102,97,97,0.10)",
        color:      C.grayWarm,
        border:     `1px solid rgba(102,97,97,0.20)`,
    },
    neutral: {
        background: C.beigeMid,
        color:      C.grayWarm,
        border:     `1px solid ${C.tanBorder}`,
    },
};

/**
 * TagList — redesigned to match new palette.
 * Props interface unchanged.
 */
export default function TagList({
                                    label, items = [], editing = false, onChange, variant = "default",
                                }) {
    const [adding, setAdding]   = useState(false);
    const [newItem, setNewItem] = useState("");

    const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

    const handleRemove = (idx) => onChange(items.filter((_, i) => i !== idx));

    const handleAdd = () => {
        const val = newItem.trim();
        if (val && !items.includes(val)) onChange([...items, val]);
        setNewItem("");
        setAdding(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter")  { e.preventDefault(); handleAdd(); }
        if (e.key === "Escape") { setNewItem(""); setAdding(false); }
    };

    return (
        <div style={{ fontFamily: SANS }}>
            <p style={{
                fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                textTransform: "uppercase", letterSpacing: "0.16em",
                color: C.tan, margin: "0 0 10px",
            }}>
                {label}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {items.map((item, idx) => (
                    <span
                        key={`${item}-${idx}`}
                        onClick={editing ? () => handleRemove(idx) : undefined}
                        style={{
                            ...s,
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "5px 12px", borderRadius: "999px",
                            fontSize: "12px", fontWeight: 500,
                            cursor: editing ? "pointer" : "default",
                            transition: "opacity 0.15s ease",
                            userSelect: "none",
                        }}
                        onMouseEnter={(e) => { if (editing) e.currentTarget.style.opacity = "0.70"; }}
                        onMouseLeave={(e) => { if (editing) e.currentTarget.style.opacity = "1"; }}
                    >
                        {item}
                        {editing && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.50 }}>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        )}
                    </span>
                ))}

                {editing && !adding && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "5px 12px", borderRadius: "999px",
                            border: `1.5px dashed ${C.tanBorder}`,
                            background: "transparent",
                            fontFamily: SANS, fontWeight: 500, fontSize: "12px",
                            color: C.tan, cursor: "pointer",
                            transition: "border-color 0.15s ease, color 0.15s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.tan; e.currentTarget.style.color = C.grayWarm; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.tanBorder; e.currentTarget.style.color = C.tan; }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add
                    </button>
                )}

                {editing && adding && (
                    <input
                        autoFocus
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleAdd}
                        placeholder="Type & Enter"
                        style={{
                            padding: "5px 12px", borderRadius: "999px",
                            border: `1.5px solid ${C.lavender}`,
                            background: "transparent",
                            fontFamily: SANS, fontSize: "12px", color: C.grayWarm,
                            outline: "none", width: "120px",
                            boxShadow: `0 0 0 3px rgba(175,154,201,0.18)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}