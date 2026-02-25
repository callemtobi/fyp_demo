"use client";

import { Database, Bell, Lock } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Settings</h1>
        <p className="text-sm text-neutral-500">
          System configuration and preferences
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Blockchain Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm text-neutral-800">Blockchain</h2>
              <p className="text-xs text-neutral-500">Network configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <div>
                <p className="text-sm text-neutral-700">Network</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Current blockchain network
                </p>
              </div>
              <span className="text-sm text-neutral-800">Ethereum Testnet</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-neutral-700">Status</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Connection status
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm text-neutral-800">Notifications</h2>
              <p className="text-xs text-neutral-500">Alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <div>
                <p className="text-sm text-neutral-700">
                  Evidence Upload Alerts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked
                  className="sr-only peer"
                  readOnly
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-neutral-700">Chain Updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked
                  className="sr-only peer"
                  readOnly
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm text-neutral-800">Security</h2>
              <p className="text-xs text-neutral-500">
                Authentication settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <div>
                <p className="text-sm text-neutral-700">Session Timeout</p>
              </div>
              <select className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-neutral-700">Change Password</p>
              </div>
              <button className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm rounded-lg hover:bg-neutral-200 transition-colors">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
