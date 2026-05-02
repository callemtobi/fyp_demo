"use client";

import axios from "axios";
import { Eye, Copy, Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkeletonTableRow } from "@/components/SkeletonLoader";

export default function EvidenceRecords() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [evidenceData, setEvidenceData] = useState([]);
  const [filteredEvidenceData, setFilteredEvidenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const truncateHash = (hash, length = 8) => {
    if (!hash) return "-";
    if (hash.length <= 16) return hash;
    return (
      hash.substring(0, length) + "..." + hash.substring(hash.length - length)
    );
  };

  const copyToClipboard = (text, hashId) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hashId);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const navigateToCoC = (evidenceId) => {
    router.push(`/chainOfCustody?id=${evidenceId}`);
  };

  const getCaseTitle = (caseRef) => {
    if (!caseRef) return "-";
    if (typeof caseRef === "string") return caseRef;
    if (typeof caseRef === "object" && caseRef.title) {
      return caseRef.title;
    }
    return "-";
  };

  const getEvidenceRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }
      const response = await axios.get("http://localhost:8000/api/evidence/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setEvidenceData(sortedData);
    } catch (err) {
      console.error("Auth Error:", err.response?.status, err.response?.data);
      setError(err.response?.data?.message || "Failed to fetch evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvidenceRecords();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = evidenceData.filter((evidence) => {
      const caseTitle = getCaseTitle(evidence.caseId).toLowerCase();
      return caseTitle.includes(searchTerm.toLowerCase());
    });
    setFilteredEvidenceData(filtered);
  }, [searchTerm, evidenceData]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Evidence Records</h1>
        <p className="text-sm text-neutral-500">
          All evidence stored on blockchain
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search evidence by case name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg bg-white text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs text-neutral-600 font-semibold">
                  Evidence ID
                </th>
                <th className="text-left px-4 py-3 text-xs text-neutral-600 font-semibold">
                  IPFS Hash
                </th>
                <th className="text-left px-4 py-3 text-xs text-neutral-600 font-semibold">
                  Case Name
                </th>
                <th className="text-left px-4 py-3 text-xs text-neutral-600 font-semibold">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs text-neutral-600 font-semibold">
                  Date & Time
                </th>
                <th className="text-center px-4 py-3 text-xs text-neutral-600 font-semibold">
                  Chain of Custody
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : filteredEvidenceData.length > 0 ? (
                filteredEvidenceData.map((evidence, index) => (
                  <tr
                    key={evidence.id || evidence._id || index}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-800 font-mono truncate block">
                        {evidence.evidenceId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={() =>
                          copyToClipboard(evidence.ipfsHash, evidence._id)
                        }
                        title={evidence.ipfsHash}
                      >
                        <code className="text-xs text-neutral-600 font-mono truncate">
                          {truncateHash(evidence.ipfsHash)}
                        </code>
                        {copiedHash === evidence._id ? (
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-700 truncate block max-w-xs">
                        {getCaseTitle(evidence.caseId)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-700 truncate">
                        {evidence.fileType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-600 whitespace-nowrap">
                        {formatDate(evidence.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigateToCoC(evidence._id)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors inline-block"
                        title="View Chain of Custody"
                      >
                        <Eye
                          className="w-4 h-4 text-blue-600"
                          strokeWidth={1.5}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-neutral-500">
                    {searchTerm
                      ? "No evidence found matching your search"
                      : "No evidence records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
