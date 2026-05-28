/**
 * DiscoverPlaces.jsx
 *
 * Shows popular places near a destination.
 * Used in:
 *   - TripRoomPage (full panel with detail expand)
 *   - CreateTripForm (compact preview after city is entered)
 *
 * Props:
 *   city        {string}
 *   country     {string}
 *   tripType    {string}  — TripType enum, used to filter relevant places
 *   compact     {boolean} — compact mode for CreateTrip form
 */

import { useState, useEffect, useCallback } from "react";
import { geocodeCity, getWeeklyForecast } from "../services/weatherApi";
import { getPlacesNearby, getPlaceDetail, formatKinds } from "../services/placesApi";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    lavenderBg: "rgba(175,154,201,0.15)",
    lavenderBorder: "rgba(175,154,201,0.32)",
    white:      "#ffffff",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

// ─── Place card ───────────────────────────────────────────────────────────────

function PlaceCard({ place, onClick, compact }) {
    const tags = formatKinds(place.kinds);

    return (
        <button
            onClick={() => onClick?.(place)}
            style={{
                display: "flex", flexDirection: "column",
                alignItems: "flex-start", gap: "8px",
                padding: compact ? "12px" : "14px",
                borderRadius: "14px",
                background: C.white,
                border: `1px solid ${C.tanBorder}`,
                boxShadow: "0 2px 0 #d4cec9",
                cursor: "pointer",
                transition: "box-shadow 0.18s ease, transform 0.18s ease",
                textAlign: "left",
                width: "100%",
                fontFamily: SANS,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 0 #bfb9b4, 0 6px 18px rgba(165,147,123,0.12)";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 0 #d4cec9";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {/* Place name */}
            <p style={{
                fontFamily: SERIF,
                fontSize: compact ? "13px" : "15px",
                color: C.dark, margin: 0,
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
            }}>
                {place.name}
            </p>

            {/* Distance */}
            {place.distance != null && (
                <span style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: "10px",
                    color: C.tan, letterSpacing: "0.06em",
                }}>
                    {place.distance < 1000
                        ? `${place.distance}m away`
                        : `${(place.distance / 1000).toFixed(1)}km away`}
                </span>
            )}

            {/* Category tags */}
            {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {tags.map((tag, i) => (
                        <span key={i} style={{
                            padding: "2px 8px", borderRadius: "999px",
                            background: C.lavenderBg,
                            border: `1px solid ${C.lavenderBorder}`,
                            fontFamily: SANS, fontWeight: 600,
                            fontSize: "9px", textTransform: "capitalize",
                            color: "#3a2d4a", letterSpacing: "0.06em",
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </button>
    );
}

// ─── Place detail modal overlay ───────────────────────────────────────────────

function PlaceDetail({ xid, name, onClose }) {
    const [detail, setDetail]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getPlaceDetail(xid)
            .then((d) => { if (!cancelled) setDetail(d); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [xid]);

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(58,55,55,0.55)",
                backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: C.white,
                    borderRadius: "20px",
                    border: `1px solid ${C.tanBorder}`,
                    boxShadow: `0 8px 0 #bfb9b4, 0 16px 48px rgba(58,55,55,0.22)`,
                    maxWidth: "480px", width: "100%",
                    maxHeight: "80vh", overflowY: "auto",
                    fontFamily: SANS,
                }}
            >
                {/* Accent strip */}
                <div style={{ height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})`, borderRadius: "20px 20px 0 0" }} />

                {/* Image */}
                {detail?.imageUrl && (
                    <img
                        src={detail.imageUrl}
                        alt={name}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                )}

                <div style={{ padding: "20px 24px 24px" }}>
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 0" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.tan, borderRightColor: C.lavender, animation: "dp-spin 0.9s linear infinite" }} />
                            <style>{`@keyframes dp-spin{to{transform:rotate(360deg)}}`}</style>
                            <span style={{ fontSize: "13px", color: C.tan }}>Loading details...</span>
                        </div>
                    ) : (
                        <>
                            <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", color: C.dark, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                                {detail?.name || name}
                            </h3>

                            {detail?.address && (
                                <p style={{ fontSize: "12px", color: C.tan, margin: "0 0 12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill={C.tan}>
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    {detail.address}
                                </p>
                            )}

                            {detail?.description ? (
                                <p style={{ fontSize: "13px", color: C.grayWarm, lineHeight: 1.65, margin: "0 0 16px" }}>
                                    {detail.description.length > 400
                                        ? detail.description.substring(0, 400) + "..."
                                        : detail.description}
                                </p>
                            ) : (
                                <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", margin: "0 0 16px" }}>
                                    No description available.
                                </p>
                            )}

                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                {detail?.wikipediaUrl && (
                                    <a
                                        href={detail.wikipediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "inline-flex", alignItems: "center", gap: "6px",
                                            padding: "8px 16px", borderRadius: "999px",
                                            background: C.lavenderBg,
                                            border: `1px solid ${C.lavenderBorder}`,
                                            fontFamily: SANS, fontWeight: 700,
                                            fontSize: "11px", textTransform: "uppercase",
                                            letterSpacing: "0.10em", color: "#3a2d4a",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Wikipedia
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </a>
                                )}
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: "8px 16px", borderRadius: "999px",
                                        border: `1px solid ${C.tanBorder}`,
                                        background: "transparent",
                                        fontFamily: SANS, fontWeight: 600,
                                        fontSize: "11px", textTransform: "uppercase",
                                        letterSpacing: "0.10em", color: C.grayWarm,
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── DiscoverPlaces ───────────────────────────────────────────────────────────

export default function DiscoverPlaces({ city, country, tripType = "", compact = false }) {
    const [places,  setPlaces]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);
    const [selected, setSelected] = useState(null); // { xid, name }

    const limit = compact ? 6 : 12;

    useEffect(() => {
        if (!city) return;
        let cancelled = false;
        setLoading(true); setError(null); setPlaces([]);

        geocodeCity(city, country)
            .then((geo) => {
                if (cancelled) return;
                if (!geo) { setError("Location not found"); setLoading(false); return; }
                return getPlacesNearby(geo.latitude, geo.longitude, tripType, limit);
            })
            .then((data) => {
                if (cancelled || !data) return;
                setPlaces(data);
            })
            .catch(() => { if (!cancelled) setError("Places unavailable"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [city, country, tripType, limit]);

    if (compact) {
        // Compact mode — used inside CreateTripForm after city is typed
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: SANS }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{
                        fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                        textTransform: "uppercase", letterSpacing: "0.18em",
                        color: C.tan, margin: 0,
                    }}>
                        Popular in {city}
                    </p>
                    {loading && (
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "1.5px solid transparent", borderTopColor: C.tan, borderRightColor: C.lavender, animation: "dp-spin 0.9s linear infinite" }} />
                    )}
                </div>
                <style>{`@keyframes dp-spin{to{transform:rotate(360deg)}}`}</style>

                {error && <p style={{ fontSize: "11px", color: C.tan, margin: 0 }}>{error}</p>}

                {!loading && !error && places.length === 0 && (
                    <p style={{ fontSize: "12px", color: C.tan, margin: 0, fontStyle: "italic" }}>No places found for this destination.</p>
                )}

                {places.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "8px" }}>
                        {places.map((p) => (
                            <PlaceCard key={p.xid} place={p} onClick={setSelected} compact />
                        ))}
                    </div>
                )}

                {selected && (
                    <PlaceDetail xid={selected.xid} name={selected.name} onClose={() => setSelected(null)} />
                )}
            </div>
        );
    }

    // Full mode — used in Trip Room
    return (
        <section style={{
            background: C.white,
            borderRadius: "20px",
            border: `1px solid ${C.tanBorder}`,
            boxShadow: `0 4px 0 #bfb9b4, 0 8px 28px rgba(165,147,123,0.10)`,
            overflow: "hidden",
            fontFamily: SANS,
        }}>
            {/* Accent strip */}
            <div style={{ height: "2px", background: `linear-gradient(to right, ${C.grayWarm}, ${C.tan}, ${C.lavender})` }} />

            {/* Header */}
            <div style={{
                padding: "16px 20px 14px",
                borderBottom: `1px solid ${C.tanBorder}`,
                background: C.beigeMid,
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", gap: "12px",
            }}>
                <div>
                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.18em", color: C.tan, margin: "0 0 3px" }}>
                        Discover Places
                    </p>
                    <h3 style={{ fontFamily: SERIF, fontSize: "clamp(1rem,2.5vw,1.2rem)", color: C.grayWarm, margin: "0 0 2px", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                        What to visit in {city}
                    </h3>
                    {tripType && (
                        <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: "11px", color: C.tan, margin: 0 }}>
                            Filtered for {tripType.replace("_", " ").toLowerCase()}
                        </p>
                    )}
                </div>
                {loading && (
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: C.tan, borderRightColor: C.lavender, animation: "dp-spin 0.9s linear infinite", flexShrink: 0 }} />
                )}
            </div>
            <style>{`@keyframes dp-spin{to{transform:rotate(360deg)}}`}</style>

            {/* Body */}
            <div style={{ padding: "16px 20px 20px" }}>

                {!loading && error && (
                    <p style={{ fontSize: "13px", color: C.tan, margin: 0, padding: "8px 0" }}>{error}</p>
                )}

                {!loading && !error && places.length === 0 && (
                    <p style={{ fontSize: "13px", color: C.tan, margin: 0, fontStyle: "italic" }}>
                        No places found for this destination.
                    </p>
                )}

                {/* Skeleton while loading */}
                {loading && (
                    <>
                        <style>{`@keyframes dp-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.dp-bone{background:linear-gradient(90deg,rgba(165,147,123,0.10) 25%,rgba(165,147,123,0.22) 37%,rgba(165,147,123,0.10) 63%);background-size:400px 100%;animation:dp-shimmer 1.4s ease infinite;border-radius:12px}`}</style>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="dp-bone" style={{ height: "88px" }} />
                            ))}
                        </div>
                    </>
                )}

                {!loading && places.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                        {places.map((p) => (
                            <PlaceCard key={p.xid} place={p} onClick={setSelected} compact={false} />
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <PlaceDetail xid={selected.xid} name={selected.name} onClose={() => setSelected(null)} />
            )}
        </section>
    );
}