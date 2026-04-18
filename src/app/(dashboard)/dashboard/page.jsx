"use client";

import { FolderOpen, Briefcase, CheckCircle2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  SkeletonStatCard,
  SkeletonChart,
  SkeletonListItem,
} from "@/components/SkeletonLoader";

export default function Dashboard() {
  const pathname = usePathname();
  const [evidenceData, setEvidenceData] = useState([]);
  const [caseData, setCaseData] = useState([]);
  const [error, setError] = useState(null);
  const [evidenceTrendData, setEvidenceTrendData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  // console.log("casee", caseData);

  const [stats, setStats] = useState([
    {
      label: "Total Evidence",
      value: 0,
      icon: FolderOpen,
      color: "blue",
    },
    {
      label: "Active Cases",
      value: "5",
      icon: Briefcase,
      color: "green",
    },
    {
      label: "Status",
      value: "Active",
      icon: CheckCircle2,
      color: "emerald",
    },
  ]);

  // Reset loading state when navigating to dashboard
  useEffect(() => {
    setLoading(true);
  }, [pathname]);

  // Update stats when evidenceData changes
  useEffect(() => {
    setStats((prevStats) => [
      {
        ...prevStats[0],
        value: evidenceData.length,
      },
      {
        ...prevStats[1],
        value: caseData.filter((e) => e.status === "open").length,
      },
      // prevStats[1],
      prevStats[2],
    ]);
  }, [evidenceData]);

  useEffect(() => {
    async function getEvidence() {
      const token = localStorage.getItem("token");
      // console.log("Token (Dashboard):", token);
      if (!token) {
        // console.log("No token found");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/evidence", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("Number of Evidence:", response.data.count);
        setEvidenceData(response.data.data);
      } catch (err) {
        // In dashboard page.jsx, line 107-109
        console.error("Auth Error:", err.response?.status, err.response?.data);
        setError(err.response?.data?.message || "Failed to fetch evidence");
      }
    }
    getEvidence();
  }, [pathname]);

  useEffect(() => {
    async function getCases() {
      const token = localStorage.getItem("token");
      // console.log("Token (Dashboard):", token);
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/cases", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("Number of Cases:", response.data.count);
        setCaseData(response.data.data);
      } catch (err) {
        // In dashboard page.jsx, line 107-109
        console.error("Auth Error:", err.response?.status, err.response?.data);
        setError(err.response?.data?.message || "Failed to fetch cases");
      }
    }
    getCases();
  }, [pathname]);

  // Fetch evidence upload trend data
  useEffect(() => {
    async function getEvidenceTrend() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/api/cases/dashboard/evidence-trend",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // console.log("Evidence Trend Data:", response.data.data);
        setEvidenceTrendData(response.data.data);
      } catch (err) {
        console.error("Error fetching evidence trend:", err);
        setError(err.response?.data?.message || "Failed to fetch trend data");
      }
    }
    getEvidenceTrend();
  }, [pathname]);

  // Fetch recent activity data
  useEffect(() => {
    async function getRecentActivityData() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/api/cases/dashboard/recent-activity",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // console.log("Recent Activity Data:", response.data.data);
        setRecentActivity(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recent activity:", err);
        setError(err.response?.data?.message || "Failed to fetch activity");
        setLoading(false);
      }
    }
    getRecentActivityData();
  }, [pathname]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Overview of forensic evidence management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`w-10 h-10 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-5 h-5 text-${stat.color}-600`}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <p className="text-2xl text-neutral-800 mb-1 text-center">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500 text-center">
                  {stat.label}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
          <h2 className="text-sm text-neutral-700">Evidence Upload Trend</h2>
        </div>
        {loading ? (
          <SkeletonChart />
        ) : evidenceTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={evidenceTrendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-neutral-500">
            <p>Loading chart data...</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm text-neutral-700 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            <>
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
              >
                <div>
                  <p className="text-sm text-neutral-700 font-medium">
                    {activity.user}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {activity.action}
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {activity.time}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-neutral-500 py-8">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
