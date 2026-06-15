const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";


export function parseBackendError(err) {
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

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Request failed" }));
        throw { status: res.status, data: err };
    }
    return res.json();
}

const authApi = {
    signup: async ({ email, username, password }) => {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });
        return handleResponse(res);
    },

    login: async ({ email, password }) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(res);
    },
};

export default authApi;