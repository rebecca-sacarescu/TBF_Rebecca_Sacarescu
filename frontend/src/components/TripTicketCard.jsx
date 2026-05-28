import MemberPreview from "./MemberPreview";
import CountdownBadge from "./CountdownBadge";
import WeatherBadge from "./WeatherBadge";

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
    error:      "#ba1a1a",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

function gateFromId(tripId) {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const letter = letters[tripId % letters.length];
    const num = String((tripId * 7 + 11) % 90 + 10);
    return `${letter}${num}`;
}

function barcodeWidths(tripId) {
    const seed = tripId || 1;
    return [1, 2, 0.5, 3, 1, 1.5, 0.5, 2, 2.5, 1, 0.5, 1.5, 1, 2, 0.5].map(
        (w, i) => w * (((seed * (i + 3)) % 3) * 0.4 + 0.8)
    );
}

function formatDateRange(startDate, endDate) {
    if (!startDate) return "—";
    try {
        const s = new Date(startDate);
        const e = new Date(endDate);
        const opts = { day: "numeric", month: "short" };
        if (s.getFullYear() === e.getFullYear()) {
            return `${s.toLocaleDateString("en-GB", opts)} — ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
        }
        return `${s.toLocaleDateString("en-GB", { ...opts, year: "numeric" })} — ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
    } catch { return startDate; }
}

function tripDuration(startDate, endDate) {
    if (!startDate || !endDate) return null;
    try {
        const diff = new Date(endDate) - new Date(startDate);
        const days = Math.round(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    } catch { return null; }
}

const TRIP_TYPE_LABELS = {
    CITY_BREAK:    "City Break",
    ROAD_TRIP:     "Road Trip",
    BEACH_ESCAPE:  "Beach Escape",
    HIKING_NATURE: "Hiking",
    CULTURE_FOOD:  "Culture & Food",
    BACKPACKING:   "Backpacking",
};

const BUDGET_LABELS = {
    BUDGET_FRIENDLY: "Budget",
    MODERATE:        "Moderate",
    LUXURY:          "Luxury",
};

function OwnerAvatar({ name = "", url }) {
    const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "").join("");
    if (url) {
        return (
            <img src={url} alt={name}
                 style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.tanBorder}`, flexShrink: 0 }}
                 onError={(e) => { e.currentTarget.style.display = "none"; }} />
        );
    }
    return (
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: `linear-gradient(135deg, ${C.grayWarm} 0%, #4d4949 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.tanBorder}` }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "8px", color: C.beigeLight, letterSpacing: "0.05em" }}>{initials}</span>
        </div>
    );
}

function BarcodeDecoration({ tripId }) {
    const widths = barcodeWidths(tripId);
    return (
        <div style={{ display: "flex", gap: "2px", height: "56px", alignItems: "stretch", opacity: 0.22 }}>
            {widths.map((w, i) => (
                <div key={i} style={{ background: C.grayWarm, width: `${w * 3.2}px`, borderRadius: "1px" }} />
            ))}
        </div>
    );
}

function MetaCell({ label, value }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.tan }}>
                {label}
            </span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "13px", color: C.dark, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {value || "—"}
            </span>
        </div>
    );
}

export default function TripTicketCard({
                                           trip,
                                           variant = "explore",
                                           pendingRequestCount = 0,
                                           onRequestBoardingClick,
                                           onManageTripClick,
                                           onOpenRoom,
                                           rightSlot,
                                       }) {
    const {
        tripId,
        ownerFullName = "",
        ownerProfilePictureUrl,
        title = "",
        destinationCity = "",
        destinationCountry = "",
        startDate,
        endDate,
        budget,
        tripType,
        targetGroupSize,
        currentMemberCount,
        spotsLeft,
        status = "OPEN",
        memberPreview = [],
        countdown,
    } = trip;

    const gate      = gateFromId(tripId);
    const duration  = tripDuration(startDate, endDate);
    const dateRange = formatDateRange(startDate, endDate);
    const tripRef   = `#TB-${String(tripId).padStart(3, "0")}`;
    const isFull    = status === "FULL" || spotsLeft === 0;
    const hasCrew   = memberPreview.length > 0;

    const typePillStyle = {
        display: "inline-flex", alignItems: "center",
        padding: "3px 10px", borderRadius: "6px",
        fontFamily: SANS, fontWeight: 700, fontSize: "9px",
        textTransform: "uppercase", letterSpacing: "0.14em",
        background: "rgba(165,147,123,0.18)",
        color: C.grayWarm,
        border: `1px solid rgba(165,147,123,0.28)`,
    };

    const statusColors = {
        OPEN:      { bg: "rgba(165,147,123,0.14)", color: C.grayWarm, border: "rgba(165,147,123,0.30)" },
        FULL:      { bg: "rgba(58,55,55,0.10)",    color: C.grayWarm, border: "rgba(58,55,55,0.20)" },
        CLOSED:    { bg: "rgba(58,55,55,0.10)",    color: C.grayWarm, border: "rgba(58,55,55,0.20)" },
        CANCELLED: { bg: "rgba(186,26,26,0.10)",   color: C.error,    border: "rgba(186,26,26,0.22)" },
        EXPIRED:   { bg: "rgba(58,55,55,0.10)",    color: C.grayWarm, border: "rgba(58,55,55,0.20)" },
    };
    const sc = statusColors[status] || statusColors.OPEN;

    return (
        <div
            style={{
                position: "relative",
                background: C.white,
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "row",
                border: `1px solid ${C.tanBorder}`,
                boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
                transition: "box-shadow 0.20s ease, transform 0.20s ease",
                fontFamily: SANS,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 0 #bfb9b4, 0 14px 40px rgba(165,147,123,0.16)`;
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`;
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />

            {variant === "owned" && pendingRequestCount > 0 && (
                <div style={{
                    position: "absolute", top: "-8px", right: "-8px", zIndex: 10,
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", borderRadius: "999px",
                    fontFamily: SANS, fontWeight: 700, fontSize: "10px", letterSpacing: "0.08em",
                    background: C.sand, color: "#3d2800",
                    border: `2px solid ${C.white}`,
                    boxShadow: `0 3px 0 #8a6e3a, 0 4px 12px rgba(227,196,155,0.45)`,
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {pendingRequestCount} {pendingRequestCount === 1 ? "REQUEST" : "REQUESTS"}
                </div>
            )}

            <div style={{ flex: 3, padding: "22px 24px 22px 26px", display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={typePillStyle}>
                        {TRIP_TYPE_LABELS[tripType] || tripType}
                    </span>
                    <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 10px", borderRadius: "6px",
                        fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                        textTransform: "uppercase", letterSpacing: "0.14em",
                        background: sc.bg, color: sc.color,
                        border: `1px solid ${sc.border}`,
                    }}>
                        {status}
                    </span>
                    {countdown && <CountdownBadge countdown={countdown} />}
                </div>

                <div>
                    <h3 style={{
                        fontFamily: SERIF,
                        fontSize: "clamp(1.2rem, 2.5vw, 1.65rem)",
                        color: C.dark,
                        lineHeight: 1.1, letterSpacing: "-0.01em", margin: 0,
                    }}>
                        {destinationCity}
                        {destinationCountry && (
                            <span style={{ color: C.tan, fontWeight: 400 }}>, {destinationCountry}</span>
                        )}
                    </h3>
                    {title && (
                        <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: "3px 0 0", lineHeight: 1.4 }}>
                            {title}
                        </p>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 24px" }}
                     className="md:grid-cols-4">
                    <MetaCell label="Departure" value={dateRange} />
                    {duration && <MetaCell label="Duration" value={`${duration} days`} />}
                    <MetaCell label="Seats left" value={isFull ? "Full" : `${spotsLeft} of ${targetGroupSize}`} />
                    <MetaCell label="Budget" value={BUDGET_LABELS[budget] || budget} />
                </div>

                {hasCrew ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <MemberPreview members={memberPreview} maxVisible={3} size={26} />
                        <span style={{ fontFamily: SANS, fontSize: "12px", color: C.tan }}>
                            <span style={{ fontWeight: 700, color: C.dark }}>{currentMemberCount}</span> / {targetGroupSize} travelers
                        </span>
                    </div>
                ) : (
                    <>
                        {variant !== "owned" && ownerFullName && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <OwnerAvatar name={ownerFullName} url={ownerProfilePictureUrl} />
                                <span style={{ fontFamily: SANS, fontSize: "12px", color: C.tan }}>
                                    by <span style={{ fontWeight: 700, color: C.dark }}>{ownerFullName}</span>
                                </span>
                            </div>
                        )}
                        {variant === "owned" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={C.tan} style={{ flexShrink: 0 }}>
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                </svg>
                                <span style={{ fontFamily: SANS, fontSize: "12px", color: C.tan }}>
                                    <span style={{ fontWeight: 700, color: C.dark }}>{currentMemberCount}</span> / {targetGroupSize} travelers
                                </span>
                            </div>
                        )}
                    </>
                )}

                <div style={{ marginTop: "auto", paddingTop: "4px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>

                    {variant === "explore" && (
                        <button
                            onClick={() => onRequestBoardingClick?.(trip)}
                            disabled={isFull}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "7px",
                                fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                                textTransform: "uppercase", letterSpacing: "0.12em",
                                padding: "10px 20px", borderRadius: "999px",
                                border: isFull ? `1px solid ${C.tanBorder}` : "none",
                                background: isFull
                                    ? "transparent"
                                    : `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`,
                                color: isFull ? C.tan : C.beigeLight,
                                boxShadow: isFull ? "none" : `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`,
                                cursor: isFull ? "not-allowed" : "pointer",
                                opacity: isFull ? 0.6 : 1,
                                transition: "all 0.15s ease",
                            }}
                        >
                            {isFull ? "Trip Full" : "Request Boarding"}
                            {!isFull && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                                </svg>
                            )}
                        </button>
                    )}

                    {variant === "owned" && (
                        <button
                            onClick={() => onManageTripClick?.(trip)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "7px",
                                fontFamily: SANS, fontWeight: 700, fontSize: "11px",
                                textTransform: "uppercase", letterSpacing: "0.12em",
                                padding: "10px 20px", borderRadius: "999px", border: "none",
                                background: `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 50%, #524f4f 100%)`,
                                color: C.beigeLight,
                                boxShadow: `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`,
                                cursor: "pointer", transition: "all 0.15s ease",
                            }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(3px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; }}
                            onMouseUp={(e)   => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 0 ${C.dark}, 0 6px 14px rgba(58,55,55,0.20)`; }}
                        >
                            Manage Trip
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                            </svg>
                        </button>
                    )}

                    {variant === "joined" && (
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                            textTransform: "uppercase", letterSpacing: "0.12em",
                            color: C.tan,
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Enrolled
                        </span>
                    )}

                    {(variant === "owned" || variant === "joined") && onOpenRoom && (
                        <button
                            onClick={() => onOpenRoom(trip)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                fontFamily: SANS, fontWeight: 700, fontSize: "10px",
                                textTransform: "uppercase", letterSpacing: "0.10em",
                                padding: "8px 14px", borderRadius: "999px",
                                background: "rgba(175,154,201,0.16)",
                                color: "#3a2d4a",
                                border: "1px solid rgba(175,154,201,0.32)",
                                boxShadow: "0 2px 0 rgba(125,106,158,0.30)",
                                cursor: "pointer", transition: "all 0.18s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(175,154,201,0.26)";
                                e.currentTarget.style.boxShadow = "0 3px 0 rgba(125,106,158,0.40)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(175,154,201,0.16)";
                                e.currentTarget.style.boxShadow = "0 2px 0 rgba(125,106,158,0.30)";
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Crew Room
                        </button>
                    )}
                </div>
            </div>

            <div
                className="hidden md:block"
                style={{
                    width: "1px", alignSelf: "stretch", flexShrink: 0,
                    backgroundImage: `linear-gradient(to bottom, ${C.tan} 50%, transparent 0%)`,
                    backgroundSize: "1px 10px",
                    backgroundRepeat: "repeat-y",
                    margin: "16px 0",
                    opacity: 0.35,
                    position: "relative",
                }}
            >
                <div style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />
                <div style={{ position: "absolute", bottom: "-16px", left: "50%", transform: "translateX(-50%)", width: "20px", height: "20px", borderRadius: "50%", background: C.beigeLight, border: `1px solid ${C.tanBorder}` }} />
            </div>

            <div
                className="hidden md:flex"
                style={{
                    flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                    padding: "22px 18px",
                    background: C.beigeMid,
                    flexShrink: 0, minWidth: "120px", maxWidth: "140px",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.14em", color: C.tan, margin: "0 0 2px" }}>
                        Gate
                    </p>
                    <p style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 800, color: C.dark, lineHeight: 1.05, margin: 0 }}>
                        {gate}
                    </p>
                </div>

                <BarcodeDecoration tripId={tripId} />

                <WeatherBadge city={destinationCity} country={destinationCountry} />

                <p style={{ fontFamily: SANS, fontSize: "7px", letterSpacing: "0.10em", color: C.tan, textAlign: "center", margin: 0, opacity: 0.70 }}>
                    {tripRef}
                </p>

                {rightSlot && <div style={{ marginTop: "8px", width: "100%" }}>{rightSlot}</div>}
            </div>
        </div>
    );
}