import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /matches
 * Returns the list of active matches for the logged-in user.
 * Backend already sorts: superLikeInvolved DESC, compatibilityScore DESC, matchedAt DESC.
 * @returns {Promise<import("../types/matches").MatchResponseDto[]>}
 */
export async function getMyMatches() {
    const response = await fetch(`${BASE_URL}/matches`, {
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
 * DELETE /matches/{matchId}
 * Removes a match. Backend verifies the current user belongs to this match.
 * @param {number} matchId
 * @returns {Promise<void>}
 */
export async function deleteMatch(matchId) {
    const response = await fetch(`${BASE_URL}/matches/${matchId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...TokenService.getAuthHeader(),
        },
    });

    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}

/**
 * Mirrors the same error-parsing pattern used in authApi.js and feedApi.js.
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