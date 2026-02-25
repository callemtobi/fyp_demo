"use client";

import { Eye } from "lucide-react";

const evidenceRecords = [
  {
    id: "EV-001",
    hash: "a3c5f8e2...e5b8a1",
    caseId: "CASE-001",
    type: "Digital Document",
    date: "2026-02-08",
    status: "Verified",
  },
  {
    id: "EV-002",
    hash: "b4d6g9f3...f6c9b2",
    caseId: "CASE-002",
    type: "Image",
    date: "2026-02-08",
    status: "Verified",
  },
  {
    id: "EV-003",
    hash: "c5e7h1g4...g7d1c3",
    caseId: "CASE-001",
    type: "Video",
    date: "2026-02-07",
    status: "Pending",
  },
  {
    id: "EV-004",
    hash: "d6f8i2h5...h8e2d4",
    caseId: "CASE-003",
    type: "Audio",
    date: "2026-02-07",
    status: "Verified",
  },
  {
    id: "EV-005",
    hash: "e7g9j3i6...i9f3e5",
    caseId: "CASE-002",
    type: "Digital Document",
    date: "2026-02-06",
    status: "Verified",
  },
];

export default function EvidenceRecords() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Evidence Records</h1>
        <p className="text-sm text-neutral-500">
          All evidence stored on blockchain
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Evidence ID
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Hash
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Case ID
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs text-neutral-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {evidenceRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-800 font-mono">
                      {record.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs text-neutral-600 font-mono">
                      {record.hash}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-700">
                      {record.caseId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-700">
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-neutral-600">
                      {record.date}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs ${
                        record.status === "Verified"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}