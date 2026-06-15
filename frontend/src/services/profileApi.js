import TokenService from "./tokenService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Request failed" }));
        throw { status: res.status, data: err };
    }
    return res.json();
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        ...TokenService.getAuthHeader(),
    };
}

const profileApi = {
    getMyProfile: async () => {
        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: "GET",
            headers: authHeaders(),
        });
        return handleResponse(res);
    },

    createProfile: async (data) => {
        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },

    updateProfile: async (data) => {
        const res = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    },
};

export function parseApiError(err) {
    if (!err?.data) return "An unexpected error occurred. Please try again.";
    const d = err.data;
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.error && !d.message) return d.error;
    if (d.errors && Array.isArray(d.errors)) return d.errors.join(". ");
    const fieldErrors = Object.entries(d)
        .filter(([k]) => !["status", "timestamp", "path", "error"].includes(k))
        .map(([, v]) => v);
    if (fieldErrors.length) return fieldErrors.join(". ");
    return "An unexpected error occurred. Please try again.";
}

export default profileApi;