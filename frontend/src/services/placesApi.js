const BASE = "https://api.opentripmap.com/0.1/en/places";
const API_KEY = import.meta.env.VITE_OPENTRIPMAP_API_KEY ?? "";
// Map TripType enum → OpenTripMap kinds
const TRIP_TYPE_KINDS = {
    CITY_BREAK:    "interesting_places,historic,architecture,cultural",
    ROAD_TRIP:     "natural,scenic_view,interesting_places",
    BEACH_ESCAPE:  "beaches,natural,water",
    HIKING_NATURE: "natural,parks,hiking,mountain",
    CULTURE_FOOD:  "cultural,historic,museums,restaurants",
    BACKPACKING:   "interesting_places,historic,natural",
};

const DEFAULT_KINDS = "interesting_places,historic,cultural,natural";

/**
 * Fetch places near coordinates for a given trip type.
 * @param {number} lat
 * @param {number} lon
 * @param {string} tripType — TripType enum value
 * @param {number} limit
 * @returns {Promise<PlaceCard[]>}
 */
export async function getPlacesNearby(lat, lon, tripType = "", limit = 12) {
    const kinds = TRIP_TYPE_KINDS[tripType] || DEFAULT_KINDS;
    const radius = 10000; // 10km radius

    const params = new URLSearchParams({
        radius,
        lon,
        lat,
        kinds,
        rate:   "3",
        format: "json",
        limit,
        ...(API_KEY && { apikey: API_KEY }),
    });

    const res = await fetch(`${BASE}/radius?${params}`);
    if (!res.ok) throw new Error("Places fetch failed");
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data
        .filter((p) => p.name && p.name.trim().length > 0)
        .map((p) => ({
            xid:      p.xid,
            name:     p.name,
            kinds:    p.kinds ?? "",
            distance: p.dist ? Math.round(p.dist) : null,
            point:    p.point,
        }));
}

/**
 * Fetch detailed info for a single place by xid.
 * Returns { name, description, imageUrl, wikipediaUrl, address }
 */
export async function getPlaceDetail(xid) {
    const url = API_KEY
        ? `${BASE}/xid/${xid}?apikey=${API_KEY}`
        : `${BASE}/xid/${xid}`;

    const res = await fetch(url);  // ← folosesti url-ul corect
    if (!res.ok) return null;
    const d = await res.json();

    return {
        xid:          d.xid,
        name:         d.name ?? "",
        description:  d.wikipedia_extracts?.text ?? d.info?.descr ?? null,
        imageUrl:     d.preview?.source ?? null,
        wikipediaUrl: d.wikipedia ?? null,
        address:      d.address
            ? [d.address.road, d.address.suburb, d.address.city].filter(Boolean).join(", ")
            : null,
        kinds:        d.kinds ?? "",
    };
}

/**
 * Format a kinds string into readable category tags.
 */
export function formatKinds(kinds = "") {
    const skip = new Set(["interesting_places", "other", "accomodations"]);
    return kinds
        .split(",")
        .map((k) => k.replace(/_/g, " ").trim())
        .filter((k) => k.length > 0 && !skip.has(k))
        .slice(0, 3);
}