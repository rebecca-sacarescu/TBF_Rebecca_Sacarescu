
const GEO_URL    = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather code → label + icon type
const WMO_MAP = {
    0:  { label: "Clear sky",        icon: "sun" },
    1:  { label: "Mainly clear",     icon: "sun" },
    2:  { label: "Partly cloudy",    icon: "cloud-sun" },
    3:  { label: "Overcast",         icon: "cloud" },
    45: { label: "Fog",              icon: "cloud" },
    48: { label: "Icy fog",          icon: "cloud" },
    51: { label: "Light drizzle",    icon: "rain" },
    53: { label: "Drizzle",          icon: "rain" },
    55: { label: "Heavy drizzle",    icon: "rain" },
    61: { label: "Slight rain",      icon: "rain" },
    63: { label: "Rain",             icon: "rain" },
    65: { label: "Heavy rain",       icon: "rain" },
    71: { label: "Slight snow",      icon: "snow" },
    73: { label: "Snow",             icon: "snow" },
    75: { label: "Heavy snow",       icon: "snow" },
    80: { label: "Rain showers",     icon: "rain" },
    81: { label: "Rain showers",     icon: "rain" },
    82: { label: "Heavy showers",    icon: "rain" },
    85: { label: "Snow showers",     icon: "snow" },
    86: { label: "Snow showers",     icon: "snow" },
    95: { label: "Thunderstorm",     icon: "storm" },
    96: { label: "Thunderstorm",     icon: "storm" },
    99: { label: "Thunderstorm",     icon: "storm" },
};

export function getWeatherMeta(code) {
    return WMO_MAP[code] ?? { label: "Unknown", icon: "sun" };
}

/**
 * Geocode a city+country string to lat/lon using Open-Meteo geocoding.
 * Returns { latitude, longitude, name, country } or null.
 */
export async function geocodeCity(city, country = "") {
    const query = [city, country].filter(Boolean).join(", ");
    const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    if (!data.results?.length) return null;
    const r = data.results[0];
    return { latitude: r.latitude, longitude: r.longitude, name: r.name, country: r.country };
}

/**
 * Fetch 7-day weather forecast for given coordinates.
 * Returns array of { date, maxTemp, minTemp, weatherCode, label, icon }
 */
export async function getWeeklyForecast(latitude, longitude) {
    const params = new URLSearchParams({
        latitude,
        longitude,
        daily: [
            "weathercode",
            "temperature_2m_max",
            "temperature_2m_min",
        ].join(","),
        timezone: "auto",
        forecast_days: "7",
    });
    const res = await fetch(`${WEATHER_URL}?${params}`);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();

    const { time, weathercode, temperature_2m_max, temperature_2m_min } = data.daily;
    return time.map((date, i) => {
        const meta = getWeatherMeta(weathercode[i]);
        return {
            date,
            maxTemp: Math.round(temperature_2m_max[i]),
            minTemp: Math.round(temperature_2m_min[i]),
            weatherCode: weathercode[i],
            label: meta.label,
            icon: meta.icon,
        };
    });
}

/**
 * Get just today's weather preview for a city.
 * Returns { temp, minTemp, maxTemp, label, icon } or null.
 */
export async function getWeatherPreview(city, country = "") {
    try {
        const geo = await geocodeCity(city, country);
        if (!geo) return null;
        const forecast = await getWeeklyForecast(geo.latitude, geo.longitude);
        if (!forecast.length) return null;
        const today = forecast[0];
        return {
            temp: Math.round((today.maxTemp + today.minTemp) / 2),
            minTemp: today.minTemp,
            maxTemp: today.maxTemp,
            label: today.label,
            icon: today.icon,
            latitude: geo.latitude,
            longitude: geo.longitude,
        };
    } catch {
        return null;
    }
}