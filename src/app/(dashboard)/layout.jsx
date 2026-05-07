"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeAxiosInterceptors } from "@/lib/axiosConfig";
import { getTokenExpirationTime, isTokenExpired } from "@/lib/jwtUtils";
import { disconnectWallet } from "@/lib/walletService";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const warningAlert = (message) => {
    return (
      <div
        class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
        role="alert"
      >
        <p class="font-bold">Be Warned</p>
        <p>{message}</p>
      </div>
    );
  };

  useEffect(() => {
    // Initialize axios interceptors once
    initializeAxiosInterceptors(router);

    // Set up token expiration monitor
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Check if token is already expired
    if (isTokenExpired(token)) {
      // alert("Your session has expired. Please login again.");
      warningAlert("Your session has expired. Please login again.");
      disconnectWallet().catch((error) => {
        console.error("Error disconnecting wallet:", error);
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }

    // Set up interval to check token expiration every 10 seconds
    const expirationCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        clearInterval(expirationCheckInterval);
        router.push("/login");
        return;
      }

      const remainingTime = getTokenExpirationTime(currentToken);

      // If less than 10 seconds remaining, warn user
      if (remainingTime <= 10 && remainingTime > 0) {
        warningAlert(
          "Your session is about to expire in " +
            remainingTime +
            " seconds. Please save your work.",
        );
      }

      // If expired, logout
      if (remainingTime <= 0) {
        warningAlert("Your session has expired. You are being logged out.");
        disconnectWallet().catch((error) => {
          console.error("Error disconnecting wallet:", error);
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        clearInterval(expirationCheckInterval);
        router.push("/login");
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(expirationCheckInterval);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full md:w-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
