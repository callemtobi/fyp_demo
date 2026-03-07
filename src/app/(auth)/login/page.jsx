"use client";

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const roles = [
  "Student Investigator",
  "Student Analyst",
  "Project Admin",
  "Supervisor",
];

export default function Login() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: selectedRole,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedRole) {
      setError("Please select a role before logging in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        },
      );
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                name="email"
                placeholder="analyst@securechain.gov"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                // defaultValue="analyst@securechain.gov"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Password
              </label>
              <input
                value={formData.password}
                onChange={handleChange}
                name="password"
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                // defaultValue="password"
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

            {error && (
              <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {loading ? "Logging in..." : "Login to SecureChain"}
            </button>
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
      <div
        className="note"
        style={{
          position: "absolute",
          top: "12rem",
          left: "57rem",
          color: "black",
          padding: "1rem",
          border: "1px solid black",
          borderRadius: "1rem",
        }}
      >
        <p>tobi659@example.com</p>
        <p>Pass123</p>
      </div>
    </div>
  );
}
