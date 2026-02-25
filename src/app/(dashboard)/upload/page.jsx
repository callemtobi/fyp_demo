"use client";

import { useState } from "react";
import { Upload, Hash, CheckCircle2 } from "lucide-react";

export default function UploadEvidence() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showHash, setShowHash] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setShowHash(false);
    }
  };

  const handleGenerateHash = () => {
    setShowHash(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Upload Evidence</h1>
        <p className="text-sm text-neutral-500">
          Upload and hash forensic evidence
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Upload Area */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h2 className="text-sm text-neutral-700 mb-4">
            Select Evidence File
          </h2>

          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-neutral-50">
            {uploadedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2
                    className="w-6 h-6 text-green-600"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm text-neutral-700 mb-1">{uploadedFile}</p>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload
                  className="w-10 h-10 text-neutral-400 mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-neutral-700 mb-4">
                  Select evidence file to upload
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Form */}
        {uploadedFile && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-sm text-neutral-700 mb-4">Evidence Details</h2>

            <div className="space-y-4">
              {/* Case ID */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Case ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., CASE-001"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Evidence Type */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Evidence Type
                </label>
                <select className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Digital Document</option>
                  <option>Image</option>
                  <option>Video</option>
                  <option>Audio</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the evidence..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hash Display */}
        {uploadedFile && showHash && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <Hash
                className="w-5 h-5 text-blue-600 mt-0.5"
                strokeWidth={1.5}
              />
              <div className="flex-1">
                <p className="text-sm text-blue-900 mb-2">
                  SHA-256 Hash Generated
                </p>
                <code className="text-xs text-blue-700 font-mono break-all block bg-white p-3 rounded">
                  a3c5f8e2b1d4e7f9c8b2a5d6e3f1b8c4e7a9b2d5f8c1e4b7a3f6d9c2e5b8a1
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  ✓ Hash stored on blockchain
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {uploadedFile && (
          <div className="flex items-center gap-3 justify-center">
            {!showHash ? (
              <button
                onClick={handleGenerateHash}
                className="px-8 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Hash & Upload
              </button>
            ) : (
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setShowHash(false);
                }}
                className="px-8 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Complete - Add Another
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
