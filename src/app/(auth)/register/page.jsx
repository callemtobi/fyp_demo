"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/lib/toastConfig";

const roles = ["Investigator", "Forensic Analyst", "Police Officer", "Judge"];

export default function Register() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match!");
      setLoading(false);
      return;
    }
    if (!selectedRole) {
      setError("Please select a role before registering.");
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
        },
      );
      console.log("Registration successful:", response.data);
      showSuccessToast("Registration successful! Redirecting to login...");
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
      {/* ── Landscape card (desktop) ── */}
      <div
        className="hidden md:flex w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
        style={{ minHeight: "min(90vh, 640px)" }}
      >
        {/* Left panel — branding */}
        <div className="w-2/5 bg-blue-600 flex flex-col justify-between p-8 text-white">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
              <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold mb-1">SecureChain</h1>
            <p className="text-sm text-blue-100">
              Blockchain-Based Forensic Evidence Management
            </p>
          </div>

          {/* Role info blurbs */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">
              Available Roles
            </p>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    selectedRole === role
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-blue-100"
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-blue-200 mt-5">
              Final Year Project · Blockchain Technology · 2026
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8">
          <h2 className="text-xl text-neutral-800 font-medium mb-5">
            Create your account
          </h2>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <Field label="Username">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                minLength={3}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            {/* Passwords side-by-side on desktop */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Password">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </Field>
              <Field label="Confirm Password">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </Field>
            </div>

            {/* Role selection (mirrors left panel clicks) */}
            <Field label="Role">
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedRole === role
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </Field>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {loading ? "Registering…" : "Register to SecureChain"}
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Login here
            </Link>
          </p>
          <p className="text-xs text-neutral-400 text-center mt-1.5">
            Secure access to forensic evidence management system
          </p>
        </div>
      </div>

      {/* ── Portrait card (mobile) ── */}
      <div className="md:hidden w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-3">
            <Shield className="w-7 h-7 text-blue-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl text-neutral-800 mb-1">SecureChain</h1>
          <p className="text-xs text-neutral-500">
            Blockchain-Based Forensic Evidence Management
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-lg text-neutral-800 mb-5 text-center">
            Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <Field label="Username">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                minLength={3}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Confirm Password">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Role">
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
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
            </Field>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {loading ? "Registering…" : "Register to SecureChain"}
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Login here
            </Link>
          </p>
          <p className="text-xs text-neutral-400 text-center mt-2">
            Secure access to forensic evidence management system
          </p>
        </div>

        <p className="text-xs text-neutral-500 text-center mt-6">
          Final Year Project · Blockchain Technology · 2026
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-neutral-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
