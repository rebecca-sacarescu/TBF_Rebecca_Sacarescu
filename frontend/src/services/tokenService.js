
const TOKEN_KEY = "jwt_token";

const TokenService = {
    getToken: () => localStorage.getItem(TOKEN_KEY),

    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),

    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    getAuthHeader: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },
};

export default TokenService;