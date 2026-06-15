import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseBackendError(response) {
    try {
        const data = await response.json();
        if (typeof data.message === "string") return data.message;
        if (typeof data.error   === "string") return data.error;
        if (Array.isArray(data.errors))        return data.errors.join(", ");
        const values = Object.values(data);
        if (values.length > 0)                 return values.join(", ");
    } catch {

    }
    return "Something went wrong. Please try again.";
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        ...TokenService.getAuthHeader(),
    };
}

export async function generateTripPlan(tripId, userPrompt = null) {
    const body = userPrompt?.trim() ? { userPrompt: userPrompt.trim() } : {};
    const response = await fetch(`${BASE_URL}/trips/${tripId}/ai-plan`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify(body),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}

export async function getTripPlan(tripId) {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/ai-plan`, {
        method:  "GET",
        headers: authHeaders(),
    });
    if (!response.ok) {
        const err = await parseBackendError(response);
        throw new Error(err);
    }
    return response.json();
}