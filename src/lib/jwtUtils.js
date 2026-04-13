/**
 * Utility functions for JWT token handling
 */

/**
 * Decode JWT token to get payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // Convert expiration time from seconds to milliseconds and compare with current time
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get remaining time until token expires (in seconds)
 * @param {string} token - JWT token
 * @returns {number} - Remaining time in seconds (negative if expired)
 */
export const getTokenExpirationTime = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const remainingTime = Math.floor((expirationTime - currentTime) / 1000);

    return remainingTime;
  } catch (error) {
    console.error("Error getting token expiration time:", error);
    return 0;
  }
};

/**
 * Clear authentication token and redirect to login
 * @param {function} router - Next.js router object
 */
export const logout = (router) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (router) {
    router.push("/login");
  }
};
