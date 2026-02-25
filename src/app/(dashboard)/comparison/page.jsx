"use client";

import { CheckCircle2, FileText } from "lucide-react";

export default function EvidenceComparison() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Evidence Comparison</h1>
        <p className="text-sm text-neutral-500">
          Compare evidence hashes for integrity verification
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Comparison Result */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2
              className="w-6 h-6 text-green-600"
              strokeWidth={1.5}
            />
            <div>
              <h2 className="text-sm text-green-900 mb-1">
                Evidence Match Confirmed
              </h2>
              <p className="text-xs text-green-700">
                Hash values match - Evidence integrity verified
              </p>
            </div>
          </div>
        </div>

        {/* Evidence Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Evidence 1 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm text-neutral-700 mb-4">Evidence A</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Evidence ID</p>
                <p className="text-sm text-neutral-800 font-mono">EV-001</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Hash</p>
                <code className="text-xs text-neutral-700 font-mono break-all block bg-neutral-50 p-2 rounded">
                  a3c5f8e2b1d4e7f9c8b2a5d6e3f1b8c4
                </code>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Case ID</p>
                <p className="text-sm text-neutral-800">CASE-001</p>
              </div>
            </div>
          </div>

          {/* Evidence 2 */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm text-neutral-700 mb-4">Evidence B</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Evidence ID</p>
                <p className="text-sm text-neutral-800 font-mono">EV-001-COPY</p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Hash</p>
                <code className="text-xs text-neutral-700 font-mono break-all block bg-neutral-50 p-2 rounded">
                  a3c5f8e2b1d4e7f9c8b2a5d6e3f1b8c4
                </code>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Case ID</p>
                <p className="text-sm text-neutral-800">CASE-001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h2 className="text-sm text-neutral-700 mb-4">Verification Results</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <p className="text-sm text-neutral-700">Hash Match</p>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-green-600"
                  strokeWidth={1.5}
                />
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                  Verified
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-neutral-100">
              <p className="text-sm text-neutral-700">Case Association</p>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-green-600"
                  strokeWidth={1.5}
                />
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                  Match
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-sm text-neutral-700">Blockchain Verification</p>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-green-600"
                  strokeWidth={1.5}
                />
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
