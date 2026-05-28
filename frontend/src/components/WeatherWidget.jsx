/**
 * WeatherWidget.jsx
 *
 * 7-day weather forecast panel for Trip Room.
 * Uses Open-Meteo — no API key, CORS ok.
 *
 * Props:
 *   destinationCity     {string}
 *   destinationCountry  {string}
 */

import { useState, useEffect } from "react";
import { geocodeCity, getWeeklyForecast } from "../services/weatherApi";
import WeatherIcon from "./WeatherIcon";

const C = {
    beigeLight: "#E9E3DE",
    beigeMid:   "#faf8f6",
    tan:        "#A5937B",
    tanBorder:  "rgba(165,147,123,0.25)",
    grayWarm:   "#666161",
    dark:       "#3a3737",
    lavender:   "#AF9AC9",
    sand:       "#E3C49B",
    white:      "#ffffff",
};
const SERIF = "'DM Serif Display', serif";
const SANS  = "'DM Sans', sans-serif";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDay(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    if (d.toDateString() === today.toDateString()) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return DAYS[d.getDay()];
}

function formatShortDate(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Skeleton() {
    return (
        <>
            <style>{`@keyframes ww-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.ww-bone{background:linear-gradient(90deg,rgba(165,147,123,0.10) 25%,rgba(165,147,123,0.22) 37%,rgba(165,147,123,0.10) 63%);background-size:400px 100%;animation:ww-shimmer 1.4s ease infinite;border-radius:8px}`}</style>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "4px 0" }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="ww-bone" style={{ minWidth: "72px", height: "100px", borderRadius: "12px", flexShrink: 0 }} />
                ))}
            </div>
        </>
    );
}

export default function WeatherWidget({ destinationCity, destinationCountry }) {
    const [forecast, setForecast]   = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [geoName, setGeoName]     = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);

    useEffect(() => {
        if (!destinationCity) return;
        let cancelled = false;
        setLoading(true); setError(null); setForecast(null);

        geocodeCity(destinationCity, destinationCountry)
            .then((geo) => {
                if (cancelled) return;
                if (!geo) { setError("Location not found"); setLoading(false); return; }
                setGeoName(`${geo.name}${geo.country ? `, ${geo.country}` : ""}`);
                return getWeeklyForecast(geo.latitude, geo.longitude);
            })
            .then((data) => {
                if (cancelled || !data) return;
                setForecast(data);
            })
            .catch(() => { if (!cancelled) setError("Weather unavailable"); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [destinationCity, destinationCountry]);

    const selected = forecast?.[selectedDay];

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
                        Weather Forecast
                    </p>
                    <h3 style={{ fontFamily: SERIF, fontSize: "clamp(1rem,2.5vw,1.2rem)", color: C.grayWarm, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                        {geoName || destinationCity}
                    </h3>
                </div>
                <div style={{
                    padding: "4px 10px", borderRadius: "999px",
                    background: "rgba(227,196,155,0.22)",
                    border: "1px solid rgba(227,196,155,0.45)",
                    fontFamily: SANS, fontWeight: 700, fontSize: "9px",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                    color: "#3d2800", flexShrink: 0,
                }}>
                    7-day
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 20px 20px" }}>

                {loading && <Skeleton />}

                {!loading && error && (
                    <p style={{ fontFamily: SANS, fontSize: "13px", color: C.tan, margin: 0, padding: "16px 0" }}>
                        {error}
                    </p>
                )}

                {!loading && !error && forecast && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* Selected day detail */}
                        {selected && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "16px",
                                padding: "16px 20px",
                                borderRadius: "14px",
                                background: C.beigeMid,
                                border: `1px solid ${C.tanBorder}`,
                                boxShadow: "0 2px 0 #d4cec9",
                            }}>
                                <WeatherIcon type={selected.icon} size={44} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: SERIF, fontSize: "clamp(1.4rem,3vw,1.8rem)", color: C.dark, margin: "0 0 2px", lineHeight: 1 }}>
                                        {selected.maxTemp}°C
                                    </p>
                                    <p style={{ fontFamily: SANS, fontSize: "12px", color: C.tan, margin: 0 }}>
                                        {selected.label}
                                    </p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "13px", color: C.dark, margin: "0 0 2px" }}>
                                        {formatDay(selected.date)}
                                    </p>
                                    <p style={{ fontFamily: SANS, fontSize: "11px", color: C.tan, margin: 0 }}>
                                        {formatShortDate(selected.date)}
                                    </p>
                                    <p style={{ fontFamily: SANS, fontSize: "11px", color: C.tan, margin: "4px 0 0" }}>
                                        {selected.minTemp}° — {selected.maxTemp}°
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 7-day strip */}
                        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                            {forecast.map((day, i) => {
                                const isSelected = i === selectedDay;
                                return (
                                    <button
                                        key={day.date}
                                        onClick={() => setSelectedDay(i)}
                                        style={{
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                                            padding: "10px 10px",
                                            borderRadius: "12px",
                                            minWidth: "68px", flexShrink: 0,
                                            border: isSelected ? "none" : `1px solid ${C.tanBorder}`,
                                            background: isSelected
                                                ? `linear-gradient(180deg, #767070 0%, ${C.grayWarm} 60%, #524f4f 100%)`
                                                : C.beigeMid,
                                            boxShadow: isSelected ? `0 3px 0 ${C.dark}` : "0 1px 0 #d4cec9",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            fontFamily: SANS,
                                        }}
                                        onMouseDown={(e) => {
                                            if (isSelected) { e.currentTarget.style.transform = "translateY(2px)"; e.currentTarget.style.boxShadow = `0 1px 0 ${C.dark}`; }
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            if (isSelected) e.currentTarget.style.boxShadow = `0 3px 0 ${C.dark}`;
                                        }}
                                    >
                                        <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: isSelected ? "rgba(233,227,222,0.65)" : C.tan }}>
                                            {formatDay(day.date).substring(0, 3)}
                                        </span>
                                        <WeatherIcon type={day.icon} size={22} />
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? C.beigeLight : C.dark }}>
                                            {day.maxTemp}°
                                        </span>
                                        <span style={{ fontSize: "10px", color: isSelected ? "rgba(233,227,222,0.55)" : C.tan }}>
                                            {day.minTemp}°
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p style={{ fontFamily: SANS, fontSize: "10px", color: C.tan, margin: 0, textAlign: "right", opacity: 0.7 }}>
                            Source: Open-Meteo — updated hourly
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}