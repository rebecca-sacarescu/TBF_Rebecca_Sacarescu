import TokenService from "./tokenService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function parseBackendError(response) {
    try {
        const data = await response.json();
        if (typeof data.message === "string") return data.message;
        if (typeof data.error   === "string") return data.error;
        if (Array.isArray(data.errors))        return data.errors.join(", ");
        const values = Object.values(data);
        if (values.length > 0) return values.join(", ");
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

export async function getTripChatMessages(tripId, page = 0, size = 30) {
    const url = `${BASE_URL}/trips/${tripId}/chat/messages?page=${page}&size=${size}`;
    const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
    });

    if (response.status === 403 || response.status === 401) {
        const err = await parseBackendError(response);
        const error = new Error(err || "You are not authorized to view this chat.");
        error.status = response.status;
        throw error;
    }

    if (!response.ok) {
        const err = await parseBackendError(response);
        const error = new Error(err);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    // Backend may return a Page object or a plain array
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    return [];
}