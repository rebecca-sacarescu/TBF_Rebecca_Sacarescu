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

function Barcode({ code }) {
    const widths = [1, 2.5, 0.5, 3, 1, 1.5, 0.5, 2, 4, 1, 0.5, 2, 1, 3, 0.5];
    return (
        <div style={{ opacity: 0.20 }}>
            <div style={{ display: "flex", gap: "2px", height: "28px", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                {widths.map((w, i) => (
                    <div key={i} style={{ background: C.grayWarm, height: "100%", width: `${w * 3.5}px`, borderRadius: "1px" }} />
                ))}
            </div>
            <p style={{ textAlign: "center", fontSize: "7px", fontFamily: "monospace", letterSpacing: "0.35em", color: C.grayWarm, marginTop: "3px" }}>
                {code}
            </p>
        </div>
    );
}

export { Barcode };

export default function BoardingPassLayout({
                                               children, stub, footerLinkText, footerLink, onFooterClick,
                                           }) {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px 16px",
            fontFamily: SANS,
            background: `
                radial-gradient(circle at 15% 25%, rgba(165,147,123,0.10) 0%, transparent 35%),
                radial-gradient(circle at 85% 75%, rgba(175,154,201,0.08) 0%, transparent 35%),
                linear-gradient(135deg, ${C.beigeLight} 0%, #f0ebe6 50%, #ede6e0 100%)
            `,
        }}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div style={{ width: "100%", maxWidth: "860px" }}>

                <header style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", paddingLeft: "4px" }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${C.grayWarm} 0%, #575353 100%)`,
                        padding: "7px", borderRadius: "10px",
                        boxShadow: `0 3px 0 ${C.dark}, 0 4px 10px rgba(58,55,55,0.18)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={C.sand}>
                            <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z" />
                        </svg>
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: "17px", color: C.grayWarm, letterSpacing: "0.02em" }}>
                        Travel Buddy
                    </span>
                </header>

                <div style={{
                    background: C.white,
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                    border: `1px solid ${C.tanBorder}`,
                    boxShadow: `0 5px 0 #bfb9b4, 0 10px 40px rgba(165,147,123,0.14), 0 2px 8px rgba(165,147,123,0.08)`,
                }}>

                    <div style={{
                        flex: "3",
                        padding: "32px 36px 36px",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        minWidth: 0,
                    }}>

                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                            background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})`,
                        }} />

                        {children}

                        <div style={{
                            position: "absolute", bottom: "18px", left: "36px",
                            display: "flex", gap: "5px",
                        }}>
                            <div style={{ width: "18px", height: "4px", borderRadius: "999px", background: C.grayWarm, opacity: 0.35 }} />
                            <div style={{ width: "5px",  height: "4px", borderRadius: "999px", background: C.tan,      opacity: 0.40 }} />
                            <div style={{ width: "5px",  height: "4px", borderRadius: "999px", background: C.lavender, opacity: 0.50 }} />
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        flex: "1",
                        maxWidth: "200px",
                        background: C.beigeLight,
                        padding: "28px 20px",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textAlign: "center",
                        position: "relative",
                        backgroundImage: `linear-gradient(to bottom, ${C.tan} 50%, transparent 0%)`,
                        backgroundPosition: "left",
                        backgroundSize: "1px 8px",
                        backgroundRepeat: "repeat-y",
                    }}>
                        <div style={{
                            position: "absolute", left: "-10px", top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: `linear-gradient(135deg, ${C.beigeLight}, #f0ebe6)`,
                            border: `1px solid ${C.tanBorder}`,
                        }} />
                        {stub}
                    </div>
                </div>

                {footerLinkText && (
                    <div style={{ marginTop: "18px", textAlign: "center" }}>
                        <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0 }}>
                            {footerLinkText}{" "}
                            <button
                                onClick={onFooterClick}
                                style={{
                                    fontFamily: SANS, fontWeight: 700, fontSize: "13px",
                                    color: C.grayWarm, background: "none", border: "none",
                                    cursor: "pointer", textDecoration: "underline",
                                    textUnderlineOffset: "2px",
                                }}
                            >
                                {footerLink}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}