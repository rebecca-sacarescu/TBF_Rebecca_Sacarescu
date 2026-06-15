
import { useState, useEffect } from "react";
import { getWeatherPreview } from "../services/weatherApi";
import WeatherIcon from "./WeatherIcon";

const SANS = "'DM Sans', sans-serif";
const C = { tan: "#A5937B", dark: "#3a3737", beigeLight: "#E9E3DE", tanBorder: "rgba(165,147,123,0.25)" };

export default function WeatherBadge({ city, country }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!city) return;
        let cancelled = false;
        getWeatherPreview(city, country)
            .then((w) => { if (!cancelled) setWeather(w); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [city, country]);

    if (loading) {
        return (
            <div style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "4px 8px", borderRadius: "8px",
                background: "rgba(165,147,123,0.10)",
                border: `1px solid ${C.tanBorder}`,
            }}>
                <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    border: "1.5px solid transparent",
                    borderTopColor: C.tan,
                    animation: "wb-spin 0.9s linear infinite",
                    flexShrink: 0,
                }} />
                <style>{`@keyframes wb-spin{to{transform:rotate(360deg)}}`}</style>
                <span style={{ fontFamily: SANS, fontSize: "9px", color: C.tan }}>...</span>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 8px", borderRadius: "8px",
            background: "rgba(165,147,123,0.10)",
            border: `1px solid ${C.tanBorder}`,
        }}>
            <WeatherIcon type={weather.icon} size={14} />
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: "11px", color: C.dark }}>
                {weather.maxTemp}°C
            </span>
            <span style={{ fontFamily: SANS, fontSize: "10px", color: C.tan }}>
                {weather.label}
            </span>
        </div>
    );
}