"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Upload,
  FolderOpen,
  GitCompare,
  FileText,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "@/lib/jwtUtils";

const allNavItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["Investigator", "Police Officer", "Judge", "Forensic Analyst"],
  },
  {
    path: "/caseCreation",
    label: "Create Case",
    icon: Briefcase,
    roles: ["Investigator", "Police Officer"],
  },
  {
    path: "/upload",
    label: "Upload Evidence",
    icon: Upload,
    roles: ["Investigator", "Police Officer", "Forensic Analyst"],
  },
  {
    path: "/reports",
    label: "Case Reports",
    icon: FileText,
    roles: ["Investigator", "Forensic Analyst"],
  },
  {
    path: "/records",
    label: "Evidence Records",
    icon: FolderOpen,
    roles: ["Investigator", "Police Officer", "Judge", "Forensic Analyst"],
  },
  {
    path: "/comparison",
    label: "Case Comparison",
    icon: GitCompare,
    roles: ["Investigator", "Police Officer", "Judge", "Forensic Analyst"],
  },
  // { path: "/accessControl", label: "Access Control", icon: Shield },
  // { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    async function getUserData() {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/getUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUserData(response.data.data);
        // Filter navigation items based on user role
        const userRole = response.data.data.role;
        const filteredNavItems = allNavItems.filter((item) =>
          item.roles.includes(userRole),
        );
        setNavItems(filteredNavItems);
        // console.log("User data fetched:", response.data.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    getUserData();
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white border border-neutral-200 rounded-lg p-2 hover:bg-neutral-50"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-neutral-600" />
        ) : (
          <Menu className="w-5 h-5 text-neutral-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen z-40 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <h1 className="text-base md:text-lg tracking-tight text-neutral-800">
            SecureChain
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Forensic Evidence System
          </p>
        </div>

        <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm md:text-sm ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 md:p-4 border-t border-neutral-200">
          <div className="px-4 py-2">
            <p className="text-sm text-neutral-700">
              {userData?.role || "Student Analyst"}
            </p>
            <p className="text-xs text-neutral-500">
              {userData?.email || "student@university.edu"}
            </p>
          </div>
          <button
            onClick={() => {
              logout(router);
            }}
            className="flex items-center gap-3 px-4 py-3 border rounded-lg bg-gray-50 text-red-500 hover:text-red-700 hover:bg-gray-100 transition-colors w-full mt-2 text-sm"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
