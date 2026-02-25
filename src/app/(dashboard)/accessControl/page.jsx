"use client";

import { Shield, User } from "lucide-react";

const roles = ["Investigator", "Analyst", "Administrator", "Judge"];

const users = [
  {
    name: "John Smith",
    email: "john@example.com",
    role: "Investigator",
  },
  {
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Analyst",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    role: "Administrator",
  },
];

export default function AccessControl() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Access Control</h1>
        <p className="text-sm text-neutral-500">
          Manage user roles and permissions
        </p>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl">
        {roles.map((role) => (
          <div
            key={role}
            className="bg-white rounded-xl border border-neutral-200 p-6 text-center"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-neutral-700">{role}</p>
          </div>
        ))}
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-4xl">
        <h2 className="text-sm text-neutral-700 mb-4">System Users</h2>

        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-700" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-neutral-800">{user.name}</p>
                  <p className="text-xs text-neutral-600">{user.email}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded">
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
