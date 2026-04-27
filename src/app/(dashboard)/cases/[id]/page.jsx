"use client";

import axios from "axios";
import {
  ChevronLeft,
  Clock,
  AlertCircle,
  Loader,
  Eye,
  Download,
  FileText,
  Hash,
  User,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import EvidenceViewerModal from "@/components/EvidenceViewerModal";

export default function CaseDetail() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id;

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Fetch case details
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch case details
        const caseResponse = await axios.get(
          `http://localhost:8000/api/cases/${caseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (caseResponse.data.success) {
          setCaseData(caseResponse.data.data);
        }

        // Fetch evidence for this case
        const evidenceResponse = await axios.get(
          `http://localhost:8000/api/evidence?caseId=${caseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (evidenceResponse.data.success) {
          setEvidence(evidenceResponse.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching case data:", err);
        setError("Failed to load case details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseData();
    }
  }, [caseId]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleViewEvidence = (evidenceItem) => {
    setSelectedEvidence(evidenceItem);
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedEvidence(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Reports</span>
      </button>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Case Not Found */}
      {!caseData && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">Case not found</p>
          <p className="text-sm text-neutral-500">
            The case you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      )}

      {caseData && (
        <>
          {/* Case Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-neutral-800">
                {caseData.title}
              </h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                {caseData.caseType}
              </span>
            </div>
            <p className="text-neutral-600">Case #{caseData.caseNumber}</p>
          </div>

          {/* Case Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Case Information Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Case Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-neutral-500 uppercase font-semibold">
                    Status
                  </label>
                  <p className="text-neutral-800 font-medium mt-1">
                    {caseData.status}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase font-semibold">
                    Jurisdiction
                  </label>
                  <p className="text-neutral-800 font-medium mt-1">
                    {caseData.jurisdiction}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Opened
                  </label>
                  <p className="text-neutral-800 font-medium mt-1">
                    {formatDate(caseData.dateOpened)}
                  </p>
                </div>

                {caseData.investigatingOfficer && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Investigating Officer
                    </label>
                    <p className="text-neutral-800 font-medium mt-1">
                      {caseData.investigatingOfficer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Description
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                {caseData.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Evidence Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">
              Associated Evidence ({evidence.length})
            </h2>

            {evidence.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-600">
                  No evidence found for this case
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evidence.map((item) => (
                  <div
                    key={item._id}
                    className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-800">
                          {item.fileName}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">
                        {item.fileType}
                      </span>
                    </div>

                    {/* Evidence Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <label className="text-neutral-500 text-xs uppercase font-semibold">
                          Size
                        </label>
                        <p className="text-neutral-800 font-medium mt-1">
                          {formatFileSize(item.fileSize)}
                        </p>
                      </div>
                      <div>
                        <label className="text-neutral-500 text-xs uppercase font-semibold">
                          Uploaded
                        </label>
                        <p className="text-neutral-800 font-medium mt-1">
                          {formatDate(item.uploadDate)}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-neutral-500 text-xs uppercase font-semibold flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          File Hash
                        </label>
                        <p className="text-neutral-800 font-mono text-xs mt-1 break-all">
                          {item.fileHash || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewEvidence(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleViewEvidence(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Case Analysis Summary Section */}
          {caseData.caseAnalysisSummary && (
            <>
              {/* Case Summary */}
              {caseData.caseAnalysisSummary.caseSummary && (
                <div className="bg-white rounded-lg border border-neutral-200 p-6 mt-8">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                    Case Analysis Summary
                  </h2>
                  <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {caseData.caseAnalysisSummary.caseSummary}
                  </div>
                  {caseData.caseAnalysisSummary.lastUpdated && (
                    <p className="text-xs text-neutral-500 mt-4">
                      Last updated:{" "}
                      {formatDate(caseData.caseAnalysisSummary.lastUpdated)}
                    </p>
                  )}
                </div>
              )}

              {/* Evidence Summary */}
              {caseData.caseAnalysisSummary.evidenceSummary && (
                <div className="bg-white rounded-lg border border-neutral-200 p-6 mt-8">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                    Evidence Analysis Summary
                  </h2>
                  <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {caseData.caseAnalysisSummary.evidenceSummary}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Evidence Viewer Modal */}
      {showViewer && selectedEvidence && (
        <EvidenceViewerModal
          evidence={selectedEvidence}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
