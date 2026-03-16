// Using fetch over axios — zero dependencies, native, sufficient for auth flows.
// Base URL comes from Vite env variable. Set VITE_API_BASE_URL in your .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

/**
 * Parse error response from Spring Boot.
 * ASSUMPTION: Spring Boot returns errors in one of these shapes:
 *   { message: "..." }
 *   { error: "...", message: "..." }
 *   { errors: ["...", "..."] }
 *   { fieldName: "validation message", ... }  (Bean Validation)
 * Adjust if your GlobalExceptionHandler uses a different format.
 */
export function parseBackendError(err) {
    if (!err?.data) return "An unexpected error occurred. Please try again.";
    const d = err.data;
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.error && !d.message) return d.error;
    if (d.errors && Array.isArray(d.errors)) return d.errors.join(". ");
    // Field-level validation errors
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
    /** @param {{ email: string, username: string, password: string }} data */
    signup: async ({ email, username, password }) => {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
        });
        return handleResponse(res);
    },

    /** @param {{ email: string, password: string }} data */
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