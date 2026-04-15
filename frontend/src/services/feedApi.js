import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /feed
 * Returns an array of FeedItemDto for the logged-in user.
 * @returns {Promise<Array>}
 */
export async function getFeed() {
    const response = await fetch(`${BASE_URL}/feed`, {
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
 * POST /feed/interact
 * Records the logged-in user's swipe decision on another profile.
 *
 * @param {string} targetUserId
 * @param {"YES" | "NO" | "SUPER_LIKE"} action
 * @returns {Promise<void>}
 */
export async function postInteraction(targetUserId, action) {
    const response = await fetch(`${BASE_URL}/feed/interact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...TokenService.getAuthHeader(),
        },
        body: JSON.stringify({ targetUserId, action }),
    });

    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}

/**
 * Matches the same error-parsing pattern used elsewhere in the project.
 * Handles all Spring Boot error response shapes.
 */
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