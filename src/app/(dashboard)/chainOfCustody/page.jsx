"use client";

import axios from "axios";
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Download,
  Eye,
  Upload,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SkeletonCard,
  SkeletonBlock,
  SkeletonListItem,
} from "@/components/SkeletonLoader";
import EvidenceViewerModal from "@/components/EvidenceViewerModal";

export default function ChainOfCustodyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const evidenceId = searchParams.get("id");

  const [chainOfCustody, setChainOfCustody] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [showViewerModal, setShowViewerModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const truncateHash = (hash, length = 16) => {
    if (!hash) return "-";
    if (hash.length <= 32) return hash;
    return (
      hash.substring(0, length) + "..." + hash.substring(hash.length - length)
    );
  };

  const copyToClipboard = (text, hashId) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hashId);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "uploaded":
        return <Upload className="w-5 h-5 text-blue-600" />;
      case "viewed":
        return <Eye className="w-5 h-5 text-green-600" />;
      case "downloaded":
        return <Download className="w-5 h-5 text-purple-600" />;
      case "transferred":
        return <ArrowLeft className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "uploaded":
        return "bg-blue-50 border-blue-200";
      case "viewed":
        return "bg-green-50 border-green-200";
      case "downloaded":
        return "bg-purple-50 border-purple-200";
      case "transferred":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "uploaded":
        return "Uploaded";
      case "viewed":
        return "Viewed";
      case "downloaded":
        return "Downloaded";
      case "transferred":
        return "Transferred";
      default:
        return "Accessed";
    }
  };

  const fetchChainOfCustody = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/evidence/${evidenceId}/chain-of-custody`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setChainOfCustody(response.data.data);
    } catch (err) {
      console.error("Error fetching chain of custody:", err);
      setError(
        err.response?.data?.message || "Failed to fetch chain of custody data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (evidenceId) {
      fetchChainOfCustody();
    }
  }, [evidenceId, pathname]);

  if (!evidenceId) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            No evidence ID provided
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Records
        </button>
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Chain of Custody
        </h1>
        <p className="text-neutral-600">
          Complete access history for the evidence file
        </p>
      </div>

      {loading && (
        <div className="space-y-8">
          {/* Evidence Details Skeleton */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-neutral-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {chainOfCustody && !loading && (
        <>
          {/* Evidence Details Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-neutral-800 mb-6">
              Evidence Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Name */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  File Name
                </p>
                <p className="text-neutral-800 break-all">
                  {chainOfCustody.evidenceName}
                </p>
              </div>

              {/* Evidence ID */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Evidence ID
                </p>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <code className="text-neutral-800 font-mono text-sm">
                    {truncateHash(chainOfCustody.evidenceId, 8)}
                  </code>
                  {copiedHash === "evidenceId" ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Copy
                      className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(chainOfCustody.evidenceId, "evidenceId")
                      }
                    />
                  )}
                </div>
              </div>

              {/* IPFS Hash */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  IPFS Hash
                </p>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <code className="text-neutral-800 font-mono text-sm">
                    {truncateHash(chainOfCustody.ipfsHash)}
                  </code>
                  {copiedHash === "ipfsHash" ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Copy
                      className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(chainOfCustody.ipfsHash, "ipfsHash")
                      }
                    />
                  )}
                </div>
              </div>

              {/* File Hash */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  File Hash (SHA-256)
                </p>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <code className="text-neutral-800 font-mono text-sm">
                    {truncateHash(chainOfCustody.fileHash)}
                  </code>
                  {copiedHash === "fileHash" ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Copy
                      className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                      onClick={() =>
                        copyToClipboard(chainOfCustody.fileHash, "fileHash")
                      }
                    />
                  )}
                </div>
              </div>

              {/* Initial Uploader */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Initial Uploader
                </p>
                <div>
                  <p className="text-neutral-800 font-medium">
                    {chainOfCustody.uploader?.name}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    {chainOfCustody.uploader?.email}
                  </p>
                </div>
              </div>

              {/* Upload Date */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Upload Date
                </p>
                <p className="text-neutral-800">
                  {formatDate(chainOfCustody.createdAt)}
                </p>
              </div>

              {/* Case ID */}
              {chainOfCustody.caseId && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Case ID
                  </p>
                  <p className="text-neutral-800">
                    {chainOfCustody.caseId.caseTitle}
                  </p>
                </div>
              )}

              {/* Blockchain Transaction */}
              {chainOfCustody.blockchainTxHash && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Blockchain Hash
                  </p>
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <code className="text-neutral-800 font-mono text-sm">
                      {truncateHash(chainOfCustody.blockchainTxHash)}
                    </code>
                    {copiedHash === "blockchainTxHash" ? (
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Copy
                        className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            chainOfCustody.blockchainTxHash,
                            "blockchainTxHash",
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain Confirmed */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Blockchain Status
                </p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    chainOfCustody.blockchainConfirmed
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {chainOfCustody.blockchainConfirmed
                    ? "✓ Confirmed"
                    : "Pending"}
                </span>
              </div>

              {/* View & Download Buttons */}
              <div className="md:col-span-2 flex gap-3">
                <button
                  onClick={() => setShowViewerModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Evidence
                </button>
                <button
                  onClick={() => setShowViewerModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Evidence
                </button>
              </div>
            </div>
          </div>

          {/* First Upload Transaction Details */}
          {chainOfCustody.chainOfCustody &&
            chainOfCustody.chainOfCustody.length > 0 &&
            chainOfCustody.chainOfCustody[0]?.action === "uploaded" && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-neutral-800 mb-6">
                  First Upload Transaction
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Uploaded By */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      Uploaded By
                    </p>
                    <div>
                      <p className="text-neutral-800 font-medium">
                        {chainOfCustody.chainOfCustody[0].user?.name}
                      </p>
                      <p className="text-neutral-600 text-sm">
                        {chainOfCustody.chainOfCustody[0].user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Upload Timestamp */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      Upload Time
                    </p>
                    <p className="text-neutral-800">
                      {formatDate(chainOfCustody.chainOfCustody[0].timestamp)}
                    </p>
                  </div>

                  {/* IP Address */}
                  {chainOfCustody.chainOfCustody[0].ipAddress && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                        Upload IP Address
                      </p>
                      <p className="text-neutral-800 font-mono">
                        {chainOfCustody.chainOfCustody[0].ipAddress}
                      </p>
                    </div>
                  )}

                  {/* User Agent */}
                  {chainOfCustody.chainOfCustody[0].userAgent && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                        User Agent
                      </p>
                      <p className="text-neutral-800 text-sm truncate">
                        {chainOfCustody.chainOfCustody[0].userAgent}
                      </p>
                    </div>
                  )}

                  {/* Transaction Hash if available */}
                  {chainOfCustody.chainOfCustody[0].txHash && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                        Transaction Hash
                      </p>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <code className="text-neutral-800 font-mono text-sm break-all">
                          {truncateHash(
                            chainOfCustody.chainOfCustody[0].txHash,
                          )}
                        </code>
                        {copiedHash === "uploadTxHash" ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Copy
                            className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                            onClick={() =>
                              copyToClipboard(
                                chainOfCustody.chainOfCustody[0].txHash,
                                "uploadTxHash",
                              )
                            }
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Statistics Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-6">
              Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {chainOfCustody.chainOfCustody?.filter(
                    (e) => e.action === "viewed",
                  ).length || 0}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-purple-600 uppercase mb-2">
                  Total Downloads
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {chainOfCustody.chainOfCustody?.filter(
                    (e) => e.action === "downloaded",
                  ).length || 0}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-600 uppercase mb-2">
                  Transfers
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {chainOfCustody.chainOfCustody?.filter(
                    (e) => e.action === "transferred",
                  ).length || 0}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-orange-600 uppercase mb-2">
                  Total Access
                </p>
                <p className="text-2xl font-bold text-orange-700">
                  {chainOfCustody.totalAccess || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Chain of Custody Timeline */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-neutral-800 mb-6">
              Access History
              <span className="text-neutral-500 text-sm font-normal ml-2">
                ({chainOfCustody.chainOfCustody?.length || 0} entries)
              </span>
            </h2>

            {chainOfCustody.chainOfCustody &&
            chainOfCustody.chainOfCustody.length > 0 ? (
              <div className="space-y-4">
                {chainOfCustody.chainOfCustody.map((entry, index) => (
                  <div
                    key={entry._id || index}
                    className={`border-l-4 p-4 rounded-lg border-neutral-200 ${getActionColor(
                      entry.action,
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-neutral-800">
                            {getActionLabel(entry.action)}
                          </h3>
                          <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="mb-3">
                          <p className="text-neutral-700 font-medium">
                            {entry.user?.name}
                          </p>
                          <p className="text-neutral-500 text-sm">
                            {entry.user?.email}
                          </p>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {entry.ipAddress && (
                            <div>
                              <p className="text-neutral-500 text-xs">
                                IP Address
                              </p>
                              <p className="text-neutral-700 font-mono">
                                {entry.ipAddress}
                              </p>
                            </div>
                          )}

                          {entry.reason && (
                            <div>
                              <p className="text-neutral-500 text-xs">Reason</p>
                              <p className="text-neutral-700">{entry.reason}</p>
                            </div>
                          )}

                          {entry.txHash && (
                            <div className="md:col-span-2">
                              <p className="text-neutral-500 text-xs mb-1">
                                Transaction Hash
                              </p>
                              <div className="flex items-center gap-2 group cursor-pointer">
                                <code className="text-neutral-700 font-mono text-xs break-all">
                                  {truncateHash(entry.txHash)}
                                </code>
                                {copiedHash === entry._id ? (
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Copy
                                    className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0"
                                    onClick={() =>
                                      copyToClipboard(entry.txHash, entry._id)
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">
                  No access history for this evidence yet
                </p>
              </div>
            )}
          </div>

          {/* Evidence Viewer Modal */}
          {showViewerModal && (
            <EvidenceViewerModal
              evidenceId={evidenceId}
              onClose={() => setShowViewerModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
