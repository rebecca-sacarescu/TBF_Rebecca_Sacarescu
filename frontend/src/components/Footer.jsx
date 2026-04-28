const C = {
    beigeLight: "#E9E3DE",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    grayWarm:   "#666161",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

export default function Footer() {
    return (
        <footer style={{
            background: C.beigeLight,
            borderTop: `1px solid ${C.tanBorder}`,
            padding: "20px 24px",
            width: "100%",
            marginTop: "auto",
            fontFamily: SANS,
        }}>
            <div style={{
                maxWidth: "1280px", margin: "0 auto",
                display: "flex", flexWrap: "wrap",
                justifyContent: "space-between", alignItems: "center",
                gap: "10px",
            }}>
                <span style={{
                    fontFamily: SERIF, fontSize: "13px",
                    color: C.tan, letterSpacing: "0.02em",
                }}>
                    Travel Buddy
                </span>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {["Privacy Policy", "Terms of Service", "Help Center"].map((t) => (
                        <span key={t} style={{
                            fontFamily: SANS, fontWeight: 500,
                            fontSize: "10px", textTransform: "uppercase",
                            letterSpacing: "0.14em", color: C.tan,
                            opacity: 0.60, cursor: "default",
                        }}>
                            {t}
                        </span>
                    ))}
                </div>
                <span style={{
                    fontFamily: SANS, fontWeight: 400,
                    fontSize: "10px", textTransform: "uppercase",
                    letterSpacing: "0.12em", color: C.tan, opacity: 0.45,
                }}>
                    2025 · Your global concierge
                </span>
            </div>
        </footer>
    );
}