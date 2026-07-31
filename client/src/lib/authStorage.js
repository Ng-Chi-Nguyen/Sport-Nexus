const AUTH_KEYS = ["accessToken", "refreshToken", "user"];

export const clearAuth = () => {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};
