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
 * @param {import("../types/trips").CreateTripInputDto} data
 * @returns {Promise<import("../types/trips").TripCardResponseDto>}
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
 * Returns all open trips the current user can join.
 * @returns {Promise<import("../types/trips").TripCardResponseDto[]>}
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
 * Returns trips created by the current user.
 * @returns {Promise<import("../types/trips").TripCardResponseDto[]>}
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
 * Returns trips the current user has joined.
 * @returns {Promise<import("../types/trips").TripCardResponseDto[]>}
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
 * Sends a join request for a trip.
 * @param {number} tripId
 * @param {{ message: string }} data
 * @returns {Promise<import("../types/trips").TripJoinRequestResponseDto>}
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
 * Returns pending join requests for a trip. Owner only.
 * @param {number} tripId
 * @returns {Promise<import("../types/trips").TripJoinRequestResponseDto[]>}
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
 * Approves a join request. Owner only.
 * @param {number} tripId
 * @param {number} requestId
 * @returns {Promise<void>}
 */
export async function approveJoinRequest(tripId, requestId) {
    const response = await fetch(
        `${BASE_URL}/trips/${tripId}/join-requests/${requestId}/approve`,
        {
            method: "POST",
            headers: authHeaders(),
        }
    );
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}

/**
 * POST /trips/{tripId}/join-requests/{requestId}/reject
 * Rejects a join request. Owner only.
 * @param {number} tripId
 * @param {number} requestId
 * @returns {Promise<void>}
 */
export async function rejectJoinRequest(tripId, requestId) {
    const response = await fetch(
        `${BASE_URL}/trips/${tripId}/join-requests/${requestId}/reject`,
        {
            method: "POST",
            headers: authHeaders(),
        }
    );
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
}