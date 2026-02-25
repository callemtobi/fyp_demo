"use client";

import {
  FolderOpen,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    label: "Total Evidence",
    value: "24",
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
];

const evidenceData = [
  { month: "Week 1", count: 3 },
  { month: "Week 2", count: 5 },
  { month: "Week 3", count: 8 },
  { month: "Week 4", count: 8 },
];

const recentActivity = [
  {
    id: "EV-001",
    action: "Evidence Uploaded",
    user: "Student Analyst",
    time: "2 hours ago",
  },
  {
    id: "EV-002",
    action: "Hash Verified",
    user: "System",
    time: "3 hours ago",
  },
  {
    id: "EV-003",
    action: "Report Generated",
    user: "Student Analyst",
    time: "1 day ago",
  },
];

export default function Dashboard() {
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
        {stats.map((stat) => {
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
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
          <h2 className="text-sm text-neutral-700">Evidence Upload Trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={evidenceData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
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
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-sm text-neutral-700 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div>
                <p className="text-sm text-neutral-700">{activity.action}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {activity.id} · {activity.user}
                </p>
              </div>
              <span className="text-xs text-neutral-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}