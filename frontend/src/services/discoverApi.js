import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /discover/{targetUserId}
 * Returns the full profile of another user for the discover view.
 * Access is gated by backend rules (no existing match, no prior explicit interaction, etc.)
 * @param {number} targetUserId
 * @returns {Promise<import("../types/discover").DiscoverProfileDto>}
 */
export async function getDiscoverProfile(targetUserId) {
    const response = await fetch(`${BASE_URL}/discover/${targetUserId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...TokenService.getAuthHeader(),
        },
    });

    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }

    return response.json();
}

/**
 * POST /discover/{targetUserId}/events
 * Logs a behavioral event. Always fire-and-forget — never block the UI.
 *
 * @param {number} targetUserId
 * @param {{ eventType: string, surface: string, dwellTimeMs?: number }} payload
 */
export function postDiscoverEvent(targetUserId, payload) {
    fetch(`${BASE_URL}/discover/${targetUserId}/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...TokenService.getAuthHeader(),
        },
        body: JSON.stringify(payload),
    }).catch(() => {});
}

async function parseBackendError(response) {
    try {
        const data = await response.json();
        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string")   return data.error;
        if (Array.isArray(data.errors))       return data.errors.join(", ");
        const values = Object.values(data);
        if (values.length > 0)                return values.join(", ");
    } catch {
        // non-JSON body
    }
    return "Something went wrong. Please try again.";
}