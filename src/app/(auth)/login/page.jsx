"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const roles = [
  "Student Investigator",
  "Student Analyst",
  "Project Admin",
  "Supervisor",
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("Student Analyst");

  const handleLogin = (e) => {
    e.preventDefault();
  };

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
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="analyst@securechain.gov"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                defaultValue="analyst@securechain.gov"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                defaultValue="password"
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Login to SecureChain
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
    </div>
  );
}
