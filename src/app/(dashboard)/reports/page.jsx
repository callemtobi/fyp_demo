"use client";

import { FileText, Download } from "lucide-react";

const reports = [
  {
    id: "RPT-001",
    title: "Evidence Summary Report",
    date: "2026-02-09",
    type: "Summary",
  },
  {
    id: "RPT-002",
    title: "Chain of Custody Audit",
    date: "2026-02-08",
    type: "Audit",
  },
  {
    id: "RPT-003",
    title: "Hash Verification Report",
    date: "2026-02-07",
    type: "Verification",
  },
];

export default function Reports() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Reports</h1>
        <p className="text-sm text-neutral-500">
          Generate and download system reports
        </p>
      </div>

      {/* Generate New Report */}
      <div className="bg-linear-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-6 mb-6 max-w-3xl">
        <h2 className="text-sm text-neutral-700 mb-4">Generate New Report</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-neutral-600 mb-2">
              Report Type
            </label>
            <select className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Summary Report</option>
              <option>Audit Report</option>
              <option>Verification Report</option>
              <option>Case Report</option>
            </select>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            Generate
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4 max-w-3xl">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText
                    className="w-6 h-6 text-blue-600"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="text-sm text-neutral-800 mb-1">
                    {report.title}
                  </h3>
                  <p className="text-xs text-neutral-600">
                    {report.id} · {report.type} · {report.date}
                  </p>
                </div>
              </div>

              <button className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
