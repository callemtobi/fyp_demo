"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import axios from "axios";

const roles = ["Investigator", "Forensic Analyst", "Police Officer", "Judge"];

export default function Register() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("Student Investigator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // walletAddress: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role before logging in.");
      setLoading(false);
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          // walletAddress: formData.walletAddress,
        },
      );
      console.log("Registration successful:", response.data);

      // Initialize axios interceptors
      initializeAxiosInterceptors(router);

      router.push("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  }, [selectedRole]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl text-neutral-800 mb-2">SecureChain</h1>
          <p className="text-sm text-neutral-500">
            Blockchain-Based Forensic Evidence Management
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <h2 className="text-lg text-neutral-800 mb-6 text-center">
            Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
                minLength={3}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
                minLength={6}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    required
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                      selectedRole === role
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address (Optional) */}
            {/* <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Wallet Address{" "}
                <span className="text-neutral-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="walletAddress"
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div> */}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {loading ? "Registering..." : "Register to SecureChain"}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-neutral-500 text-center mt-6">
            Secure access to forensic evidence management system
          </p>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-neutral-500 text-center mt-8">
          Final Year Project | Blockchain Technology | 2026
        </p>
      </div>
    </div>
  );
}
