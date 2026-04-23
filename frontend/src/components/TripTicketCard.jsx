// ─── TripTicketCard.jsx ───────────────────────────────────────────────────────
// Shared boarding-pass style card used in both OpenTripsPage and MyTripsPage.
// Zero external dependencies — all icons are inline SVG.

/**
 * Generates a deterministic gate code from a tripId.
 * Same tripId always produces the same gate — no random re-renders.
 */
function gateFromId(tripId) {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const letter = letters[tripId % letters.length];
    const num = String((tripId * 7 + 11) % 90 + 10);
    return `${letter}${num}`;
}

/**
 * Generates deterministic barcode bar widths from a tripId.
 */
function barcodeWidths(tripId) {
    const seed = tripId || 1;
    return [1, 2, 0.5, 3, 1, 1.5, 0.5, 2, 2.5, 1, 0.5, 1.5, 1, 2, 0.5].map(
        (w, i) => w * (((seed * (i + 3)) % 3) * 0.4 + 0.8)
    );
}

/**
 * Formats a date range into a human-readable string.
 * e.g. "12 Jun — 16 Jun 2026"
 */
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
    } catch {
        return startDate;
    }
}

/**
 * Calculates trip duration in days.
 */
function tripDuration(startDate, endDate) {
    if (!startDate || !endDate) return null;
    try {
        const diff = new Date(endDate) - new Date(startDate);
        const days = Math.round(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : null;
    } catch {
        return null;
    }
}

// ─── Enum display maps ────────────────────────────────────────────────────────

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

// Trip type accent colors — using existing Tailwind token classes
const TRIP_TYPE_COLORS = {
    CITY_BREAK:    { bg: "bg-secondary-fixed",  text: "text-on-secondary-fixed" },
    ROAD_TRIP:     { bg: "bg-tertiary-fixed",    text: "text-on-tertiary-fixed" },
    BEACH_ESCAPE:  { bg: "bg-primary-fixed",     text: "text-on-primary-fixed" },
    HIKING_NATURE: { bg: "bg-secondary-fixed",   text: "text-on-secondary-fixed" },
    CULTURE_FOOD:  { bg: "bg-tertiary-fixed",    text: "text-on-tertiary-fixed" },
    BACKPACKING:   { bg: "bg-primary-fixed",     text: "text-on-primary-fixed" },
};

const STATUS_STYLES = {
    OPEN:      { bg: "bg-secondary-fixed",      text: "text-on-secondary-fixed",       label: "OPEN" },
    FULL:      { bg: "bg-surface-container",    text: "text-on-surface-variant",        label: "FULL" },
    CLOSED:    { bg: "bg-surface-container",    text: "text-on-surface-variant",        label: "CLOSED" },
    CANCELLED: { bg: "bg-error-container",      text: "text-on-error-container",        label: "CANCELLED" },
};

// ─── Owner avatar ─────────────────────────────────────────────────────────────

function OwnerAvatar({ name = "", url }) {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

    if (url) {
        return (
            <img
                src={url}
                alt={name}
                className="w-6 h-6 rounded-full object-cover border border-outline-variant flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
        );
    }
    return (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="font-label font-bold text-on-primary" style={{ fontSize: "8px", letterSpacing: "0.05em" }}>
                {initials}
            </span>
        </div>
    );
}

// ─── Barcode stub decoration ──────────────────────────────────────────────────

function BarcodeDecoration({ tripId }) {
    const widths = barcodeWidths(tripId);
    return (
        <div className="flex gap-[2px] h-14 items-stretch opacity-20">
            {widths.map((w, i) => (
                <div
                    key={i}
                    className="bg-primary rounded-[1px]"
                    style={{ width: `${w * 3.2}px` }}
                />
            ))}
        </div>
    );
}

// ─── Meta cell (label + value pair) ──────────────────────────────────────────

function MetaCell({ label, value }) {
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span
                className="font-label uppercase text-outline"
                style={{ fontSize: "9px", letterSpacing: "0.12em", fontWeight: 600 }}
            >
                {label}
            </span>
            <span className="font-label font-semibold text-on-surface text-sm leading-tight truncate">
                {value || "—"}
            </span>
        </div>
    );
}

// ─── TripTicketCard ───────────────────────────────────────────────────────────

/**
 * @param {{
 *   trip: import("../types/trips").TripCardResponseDto,
 *   variant?: "explore" | "owned" | "joined",
 *   pendingRequestCount?: number,
 *   onRequestBoardingClick?: (trip) => void,
 *   onManageTripClick?: (trip) => void,
 *   rightSlot?: React.ReactNode,
 * }} props
 *
 * variant:
 *   "explore" — shows "Request Boarding" CTA
 *   "owned"   — shows "Manage Trip" CTA + pending requests badge
 *   "joined"  — shows owner info, read-only
 */
export default function TripTicketCard({
                                           trip,
                                           variant = "explore",
                                           pendingRequestCount = 0,
                                           onRequestBoardingClick,
                                           onManageTripClick,
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
    } = trip;

    const gate = gateFromId(tripId);
    const duration = tripDuration(startDate, endDate);
    const dateRange = formatDateRange(startDate, endDate);
    const typeColors = TRIP_TYPE_COLORS[tripType] || TRIP_TYPE_COLORS.CITY_BREAK;
    const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
    const tripRef = `#TB-${String(tripId).padStart(3, "0")}`;
    const isFull = status === "FULL" || spotsLeft === 0;

    return (
        <div
            className="relative bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row group"
            style={{
                boxShadow: "0 4px 24px rgba(0,29,69,0.06), 0 1px 4px rgba(0,29,69,0.04)",
                border: "1px solid rgba(0,29,69,0.06)",
                transition: "box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,29,69,0.10), 0 2px 8px rgba(0,29,69,0.06)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,29,69,0.06), 0 1px 4px rgba(0,29,69,0.04)";
            }}
        >
            {/* Accent strip top */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary-fixed-dim md:w-0.5 md:h-full md:top-0 md:left-0 md:bg-gradient-to-b" />

            {/* Pending requests badge — owned variant */}
            {variant === "owned" && pendingRequestCount > 0 && (
                <div
                    className="absolute -top-2 -right-2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full font-label font-bold shadow-lg"
                    style={{
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        background: "#ffb77d",
                        color: "#2f1500",
                        border: "2px solid #fff",
                        boxShadow: "0 4px 12px rgba(255,183,125,0.40)",
                    }}
                >
                    {/* Person add icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    {pendingRequestCount} {pendingRequestCount === 1 ? "REQUEST" : "REQUESTS"}
                </div>
            )}

            {/* ── Main body (≈70%) ───────────────────────────────────────── */}
            <div className="flex-[3] p-6 md:p-7 flex flex-col gap-4 min-w-0 md:pl-8">

                {/* Row 1: type pill + status badge */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-label font-semibold uppercase ${typeColors.bg} ${typeColors.text}`}
                        style={{ fontSize: "9px", letterSpacing: "0.14em" }}
                    >
                        {TRIP_TYPE_LABELS[tripType] || tripType}
                    </span>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded font-label font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}
                        style={{ fontSize: "9px", letterSpacing: "0.14em" }}
                    >
                        {statusStyle.label}
                    </span>
                </div>

                {/* Row 2: destination */}
                <div>
                    <h3
                        className="font-headline font-extrabold text-primary leading-tight tracking-tight"
                        style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
                    >
                        {destinationCity}
                        {destinationCountry && (
                            <span className="text-on-surface-variant font-normal">, {destinationCountry}</span>
                        )}
                    </h3>
                    {title && (
                        <p className="font-body text-sm text-on-surface-variant mt-0.5 leading-snug">
                            {title}
                        </p>
                    )}
                </div>

                {/* Row 3: meta grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                    <MetaCell label="Departure" value={dateRange} />
                    {duration && <MetaCell label="Duration" value={`${duration} days`} />}
                    <MetaCell
                        label="Seats left"
                        value={isFull ? "Full" : `${spotsLeft} of ${targetGroupSize}`}
                    />
                    <MetaCell label="Budget" value={BUDGET_LABELS[budget] || budget} />
                </div>

                {/* Row 4: owner (for explore + joined) */}
                {variant !== "owned" && ownerFullName && (
                    <div className="flex items-center gap-2">
                        <OwnerAvatar name={ownerFullName} url={ownerProfilePictureUrl} />
                        <span className="font-label text-xs text-on-surface-variant">
                            by <span className="font-semibold text-on-surface">{ownerFullName}</span>
                        </span>
                    </div>
                )}

                {/* Row 4 (owned): group members count */}
                {variant === "owned" && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-secondary flex-shrink-0">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <span className="font-label text-xs text-on-surface-variant">
                            <span className="font-semibold text-on-surface">{currentMemberCount}</span> / {targetGroupSize} travelers
                        </span>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-1">
                    {variant === "explore" && (
                        <button
                            onClick={() => onRequestBoardingClick?.(trip)}
                            disabled={isFull}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                fontSize: "11px",
                                letterSpacing: "0.12em",
                                background: isFull ? "transparent" : "#001d45",
                                color: isFull ? "#737780" : "#ffffff",
                                border: isFull ? "1px solid #c3c6d1" : "none",
                                padding: "10px 20px",
                                borderRadius: "999px",
                                boxShadow: isFull ? "none" : "0 4px 16px rgba(0,29,69,0.20)",
                            }}
                        >
                            {isFull ? "Trip Full" : "Request Boarding"}
                            {!isFull && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    )}

                    {variant === "owned" && (
                        <button
                            onClick={() => onManageTripClick?.(trip)}
                            className="inline-flex items-center gap-2 font-label font-bold uppercase transition-all active:scale-95"
                            style={{
                                fontSize: "11px",
                                letterSpacing: "0.12em",
                                background: "#001d45",
                                color: "#ffffff",
                                padding: "10px 20px",
                                borderRadius: "999px",
                                boxShadow: "0 4px 16px rgba(0,29,69,0.20)",
                            }}
                        >
                            Manage Trip
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {variant === "joined" && (
                        <span
                            className="inline-flex items-center gap-1.5 font-label font-semibold uppercase"
                            style={{
                                fontSize: "10px",
                                letterSpacing: "0.12em",
                                color: "#0c6780",
                            }}
                        >
                            {/* Check icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Enrolled
                        </span>
                    )}
                </div>
            </div>

            {/* ── Dashed perforation separator ────────────────────────────── */}
            <div
                className="hidden md:block w-px self-stretch flex-shrink-0 relative"
                style={{
                    backgroundImage: "linear-gradient(to bottom, #c3c6d1 50%, transparent 0%)",
                    backgroundSize: "1px 10px",
                    backgroundRepeat: "repeat-y",
                    margin: "16px 0",
                }}
            >
                {/* Notch circles */}
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                    style={{ background: "#f2f4f6", border: "1px solid rgba(0,0,0,0.04)" }}
                />
                <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                    style={{ background: "#f2f4f6", border: "1px solid rgba(0,0,0,0.04)" }}
                />
            </div>

            {/* ── Stub (≈28%) ──────────────────────────────────────────────── */}
            <div className="hidden md:flex flex-col items-center justify-between py-6 px-5 bg-surface-container-low flex-shrink-0" style={{ minWidth: "120px", maxWidth: "140px" }}>
                {/* Gate */}
                <div className="text-center">
                    <p
                        className="font-label uppercase text-outline"
                        style={{ fontSize: "9px", letterSpacing: "0.14em", fontWeight: 600 }}
                    >
                        Gate
                    </p>
                    <p className="font-headline font-extrabold text-primary" style={{ fontSize: "1.75rem", lineHeight: 1.1 }}>
                        {gate}
                    </p>
                </div>

                {/* Barcode */}
                <BarcodeDecoration tripId={tripId} />

                {/* Trip ref */}
                <p
                    className="font-mono text-outline text-center"
                    style={{ fontSize: "7px", letterSpacing: "0.1em" }}
                >
                    {tripRef}
                </p>

                {/* Right slot (optional — used for extra actions) */}
                {rightSlot && <div className="mt-2 w-full">{rightSlot}</div>}
            </div>
        </div>
    );
}