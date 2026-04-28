import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseBackendError(response) {
    try {
        const data = await response.json();
        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string") return data.error;
        if (Array.isArray(data.errors)) return data.errors.join(", ");
        const values = Object.values(data);
        if (values.length > 0) return values.join(", ");
    } catch {
        // non-JSON body
    }
    return "Something went wrong. Please try again.";
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        ...TokenService.getAuthHeader(),
    };
}

/**
 * POST /trips
 * Creates a new trip. Owner is derived from JWT.
 */
export async function createTrip(data) {
    const response = await fetch(`${BASE_URL}/trips`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * GET /trips/joinable
 */
export async function getJoinableTrips() {
    const response = await fetch(`${BASE_URL}/trips/joinable`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * GET /trips/mine/created
 */
export async function getMyCreatedTrips() {
    const response = await fetch(`${BASE_URL}/trips/mine/created`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * GET /trips/mine/joined
 */
export async function getMyJoinedTrips() {
    const response = await fetch(`${BASE_URL}/trips/mine/joined`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * POST /trips/{tripId}/join-requests
 */
export async function requestToJoinTrip(tripId, data) {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/join-requests`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * GET /trips/{tripId}/join-requests
 */
export async function getTripJoinRequests(tripId) {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/join-requests`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

/**
 * POST /trips/{tripId}/join-requests/{requestId}/approve
 */
export async function approveJoinRequest(tripId, requestId) {
    const response = await fetch(
        `${BASE_URL}/trips/${tripId}/join-requests/${requestId}/approve`,
        { method: "POST", headers: authHeaders() }
    );
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}

/**
 * POST /trips/{tripId}/join-requests/{requestId}/reject
 */
export async function rejectJoinRequest(tripId, requestId) {
    const response = await fetch(
        `${BASE_URL}/trips/${tripId}/join-requests/${requestId}/reject`,
        { method: "POST", headers: authHeaders() }
    );
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}

// ─── NEW: Crew Insights ───────────────────────────────────────────────────────

/**
 * GET /trips/{tripId}/crew-insights
 * Returns group dynamics and crew insights for a specific trip.
 * @param {number} tripId
 * @returns {Promise<{
 *   groupSize: number, targetGroupSize: number, spotsLeft: number,
 *   dominantBudget: string, dominantPlanningStyle: string, dominantSocialBattery: string,
 *   topLanguages: {name:string, count:number}[],
 *   topActivities: {name:string, count:number}[],
 *   groupVibe: string,
 *   insights: string[]
 * }>}
 */
export async function getCrewInsights(tripId) {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/crew-insights`, {
        method: "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}