/**
 * WeatherIcon.jsx
 * Inline SVG icons for weather states: sun, cloud-sun, cloud, rain, snow, storm
 */

const C = {
    sun:    "#E3C49B",
    cloud:  "#A5937B",
    rain:   "#AF9AC9",
    snow:   "#E9E3DE",
    storm:  "#666161",
};

export default function WeatherIcon({ type = "sun", size = 20, style = {} }) {
    const s = { width: size, height: size, flexShrink: 0, ...style };

    if (type === "sun") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={C.sun} style={s}>
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={C.sun} strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>
    );

    if (type === "cloud-sun") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={s}>
            <circle cx="14" cy="8" r="3.5" fill={C.sun}/>
            <path d="M14 3V1.5M14 13v-1M9.17 5.17L8.11 4.11M19.89 4.11L18.83 5.17M6.5 8H5M21 8h-1.5" stroke={C.sun} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M7 17.5A3.5 3.5 0 0 1 7 10.5a3.5 3.5 0 0 1 6.9-.8A2.5 2.5 0 1 1 16.5 15H7.5" fill={C.cloud}/>
        </svg>
    );

    if (type === "cloud") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={C.cloud} style={s}>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        </svg>
    );

    if (type === "rain") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={s}>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={C.cloud}/>
            <path d="M8 19v3M12 17v3M16 19v3" stroke={C.rain} strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );

    if (type === "snow") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={s}>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={C.cloud}/>
            <path d="M8 19l1 2-1 1M16 19l1 2-1 1M12 17v6" stroke={C.snow} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );

    if (type === "storm") return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={s}>
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={C.storm}/>
            <path d="M13 11l-2 4h4l-2 4" stroke={C.sun} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
    );

    return null;
}