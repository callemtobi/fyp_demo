"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  GitCompare,
  FileText,
  Shield,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/upload", label: "Upload Evidence", icon: Upload },
  { path: "/records", label: "Evidence Records", icon: FolderOpen },
  { path: "/comparison", label: "Evidence Comparison", icon: GitCompare },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/accessControl", label: "Access Control", icon: Shield },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <h1 className="text-lg tracking-tight text-neutral-800">SecureChain</h1>
        <p className="text-xs text-neutral-500 mt-1">
          Forensic Evidence System
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="px-4 py-2">
          <p className="text-sm text-neutral-700">Student Analyst</p>
          <p className="text-xs text-neutral-500">student@university.edu</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors w-full mt-2"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
// ```

// ---

// ## How It Works After the Fix
// ```
// User clicks "Reports" in sidebar
//         ↓
// Next.js navigates to /reports
//         ↓
// layout.js renders: <Sidebar /> + <reports/page.jsx as children>
//         ↓
// Sidebar stays visible, content loads on the right ✅
