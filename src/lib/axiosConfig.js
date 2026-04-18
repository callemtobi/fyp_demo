import axios from "axios";
import { logout } from "./jwtUtils";
import { disconnectWallet } from "./walletService";

let router = null;

/**
 * Initialize axios interceptors
 * Must be called once when the app loads
 * @param {object} nextRouter - Next.js router object
 */
export const initializeAxiosInterceptors = (nextRouter) => {
  router = nextRouter;

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if error is due to token expiration
      if (
        error.response?.status === 401 &&
        error.response?.data?.code === "TOKEN_EXPIRED"
      ) {
        // Show alert to user
        alert("Your session has expired. Please login again.");

        // Disconnect wallet first
        try {
          await disconnectWallet();
        } catch (walletError) {
          console.error("Error disconnecting wallet:", walletError);
        }

        // Clear token and redirect to login
        logout(router);

        return Promise.reject(new Error("Token expired"));
      }

      // Check if error is 401 without specific code (other auth errors)
      if (error.response?.status === 401) {
        // Show alert to user
        alert("Session expired or invalid. Please login again.");

        // Disconnect wallet first
        try {
          await disconnectWallet();
        } catch (walletError) {
          console.error("Error disconnecting wallet:", walletError);
        }

        // Clear token and redirect to login
        logout(router);

        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );
};

/**
 * Create an axios instance with the API base URL
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

/**
 * Add request interceptor to include token in requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Add response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || "Unauthorized";

      // Show alert to user
      if (message.toLowerCase().includes("expired")) {
        alert("Your session has expired. Please login again.");
      } else {
        alert("Session invalid. Please login again.");
      }

      // Clear token and redirect to login
      if (router) {
        logout(router);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
