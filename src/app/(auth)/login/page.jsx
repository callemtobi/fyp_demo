"use client";

import { useEffect, useState } from "react";
import { Shield, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { initializeAxiosInterceptors } from "@/lib/axiosConfig";

const roles = ["Investigator", "Forensic Analyst", "Police Officer", "Judge"];

const testCredentials = [
  { email: "max659@example.com", password: "Pass123", role: "Police Officer" },
  { email: "judge@gmail.com", password: "judge123", role: "Judge" },
  { email: "invest@gmail.com", password: "Pass123", role: "Investigator" },
];

export default function Login() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: selectedRole,
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
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
      localStorage.setItem("token", response.data.token);
      initializeAxiosInterceptors(router);
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
      {/* ── Landscape card (desktop) ── */}
      <div
        className="hidden md:flex w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
        style={{ minHeight: "min(90vh, 620px)" }}
      >
        {/* Left panel — branding + test credentials */}
        <div className="w-2/5 bg-blue-600 flex flex-col justify-between p-8 text-white">
          {/* Logo */}
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
              <Shield className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold mb-1">SecureChain</h1>
            <p className="text-sm text-blue-100">
              Blockchain-Based Forensic Evidence Management
            </p>
          </div>

          {/* Test credentials */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">
              Test Credentials
            </p>
            <div
              className="space-y-3"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {testCredentials.map((cred, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3 text-xs">
                  <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-wide mb-2">
                    {cred.role}
                  </p>
                  <CredRow
                    label="Email"
                    value={cred.email}
                    id={`email-${i}`}
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CredRow
                    label="Pass"
                    value={cred.password}
                    id={`pass-${i}`}
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-blue-200 mt-4">
              Final Year Project · Blockchain Technology · 2026
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center px-10 py-8">
          <h2 className="text-xl text-neutral-800 font-medium mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="analyst@securechain.gov"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

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
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors mt-2"
            >
              {loading ? "Logging in…" : "Login to SecureChain"}
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-5">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700"
            >
              Register here
            </Link>
          </p>
          <p className="text-xs text-neutral-400 text-center mt-2">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email Address">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="analyst@securechain.gov"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {loading ? "Logging in…" : "Login to SecureChain"}
            </button>
          </form>

          <p className="text-xs text-neutral-500 text-center mt-5">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700"
            >
              Register here
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

/* ── Helpers ── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-neutral-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CredRow({ label, value, id, copiedField, onCopy }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <span className="text-blue-200 w-9 shrink-0">{label}:</span>
      <span className="text-white flex-1 truncate font-mono text-[11px]">
        {value}
      </span>
      <button onClick={() => onCopy(value, id)} className="shrink-0 ml-1">
        {copiedField === id ? (
          <Check className="w-3.5 h-3.5 text-green-300" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-blue-300 hover:text-white" />
        )}
      </button>
    </div>
  );
}
