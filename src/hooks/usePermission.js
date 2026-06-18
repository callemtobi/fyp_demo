import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { showErrorToast } from "@/lib/toastConfig";

/**
 * Custom hook to check if user has required role(s)
 * @param {string | string[]} requiredRoles - Role(s) required to access the page
 * @param {boolean} redirectOnUnauthorized - Whether to redirect to dashboard if unauthorized
 * @returns {object} - { user, hasPermission, isLoading, error }
 */
export const usePermission = (requiredRoles, redirectOnUnauthorized = true) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setHasPermission(false);
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/auth/getUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const userData = response.data.data;
        setUser(userData);

        // Convert requiredRoles to array if it's a string
        const rolesArray = Array.isArray(requiredRoles)
          ? requiredRoles
          : [requiredRoles];

        // Check if user has any of the required roles
        const userHasPermission = rolesArray.includes(userData.role);

        setHasPermission(userHasPermission);

        if (!userHasPermission && redirectOnUnauthorized) {
          // Show toast and redirect
          showErrorToast(
            "You do not have permission to access this page. Your role is: " +
              userData.role,
          );
          router.push("/dashboard");
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error checking permission:", err);
        setError(err.message);
        setHasPermission(false);
        setIsLoading(false);

        if (redirectOnUnauthorized) {
          router.push("/dashboard");
        }
      }
    };

    checkPermission();
  }, [requiredRoles, redirectOnUnauthorized, router]);

  return { user, hasPermission, isLoading, error };
};

/**
 * Custom hook to check if user can perform an action
 * @param {string | string[]} allowedRoles - Role(s) allowed to perform the action
 * @returns {object} - { canPerform, user, isLoading, error }
 */
export const useCanPerform = (allowedRoles) => {
  const [canPerform, setCanPerform] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAbility = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setCanPerform(false);
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/auth/getUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const userData = response.data.data;
        setUser(userData);

        // Convert allowedRoles to array if it's a string
        const rolesArray = Array.isArray(allowedRoles)
          ? allowedRoles
          : [allowedRoles];

        // Check if user has any of the allowed roles
        const userCanPerform = rolesArray.includes(userData.role);

        setCanPerform(userCanPerform);
        setIsLoading(false);
      } catch (err) {
        console.error("Error checking ability:", err);
        setError(err.message);
        setCanPerform(false);
        setIsLoading(false);
      }
    };

    checkAbility();
  }, [allowedRoles]);

  return { canPerform, user, isLoading, error };
};
