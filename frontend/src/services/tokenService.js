// CHOICE: localStorage over sessionStorage so sessions persist across tabs & refreshes.
// In production, consider httpOnly cookies for better XSS protection.

const TOKEN_KEY = "jwt_token";

const TokenService = {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),

    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    /** Returns headers object with Bearer token if available */
    getAuthHeader: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    /** Check if user is currently authenticated */
    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

    /** Logout — clears token */
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },
};

export default TokenService;