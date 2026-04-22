import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GET /saved-profiles
 * Returns all profiles saved by the logged-in user.
 * @returns {Promise<import("../types/savedProfiles").SavedProfileDto[]>}
 */
export async function getSavedProfiles() {
    const response = await fetch(`${BASE_URL}/saved-profiles`, {
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
 * POST /saved-profiles/{targetUserId}
 * Saves a profile. Save does not create a match and does not remove from feed.
 * @param {number} targetUserId
 * @returns {Promise<void>}
 */
export async function saveProfile(targetUserId) {
    const response = await fetch(`${BASE_URL}/saved-profiles/${targetUserId}`, {
        method: "POST",
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
 * DELETE /saved-profiles/{targetUserId}
 * Removes a saved profile.
 * @param {number} targetUserId
 * @returns {Promise<void>}
 */
export async function unsaveProfile(targetUserId) {
    const response = await fetch(`${BASE_URL}/saved-profiles/${targetUserId}`, {
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