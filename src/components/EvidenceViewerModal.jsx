"use client";

import axios from "axios";
import { X, Download, Eye, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function EvidenceViewerModal({
  evidenceId,
  onClose,
  onViewTracked,
  onDownloadTracked,
}) {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewTracked, setViewTracked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/evidence/${evidenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEvidence(response.data.data);
    } catch (err) {
      console.error("Error fetching evidence:", err);
      setError(err.response?.data?.message || "Failed to fetch evidence");
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/evidence/${evidenceId}/track-view`,
        {
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setViewTracked(true);
      if (onViewTracked) onViewTracked();
    } catch (err) {
      console.warn("Failed to track view:", err);
    }
  };

  const trackDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/evidence/${evidenceId}/track-download`,
        {
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (onDownloadTracked) onDownloadTracked();
    } catch (err) {
      console.warn("Failed to track download:", err);
    }
  };

  const handleDownload = async () => {
    if (!evidence) return;

    try {
      setDownloadInProgress(true);
      setDownloading(true);

      // Track the download
      await trackDownload();

      // Download the file from IPFS
      const ipfsGateway = "https://gateway.pinata.cloud/ipfs/";
      const fileUrl = ipfsGateway + evidence.ipfsHash;

      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", evidence.fileName || "evidence-file");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError("Failed to download file");
    } finally {
      setDownloadInProgress(false);
      setDownloading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    if (!viewTracked) {
      trackView();
    }
  };

  useEffect(() => {
    if (evidenceId) {
      fetchEvidence();
    }
  }, [evidenceId]);

  useEffect(() => {
    if (evidence && evidence.fileType?.startsWith("image/")) {
      setImageLoading(true);
    }
  }, [evidence]);

  const isImageFile = evidence?.fileType?.startsWith("image/");
  const isPdfFile = evidence?.fileType === "application/pdf";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 p-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              {evidence?.fileName || "View Evidence"}
            </h2>
            <p className="text-sm text-neutral-500">
              {evidence?.fileType || ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : evidence ? (
            <div className="space-y-6">
              {/* Image/File Preview */}
              <div className="bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200">
                {isImageFile ? (
                  <div className="relative w-full h-96 flex items-center justify-center">
                    {imageLoading && (
                      <div className="animate-spin absolute">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                      </div>
                    )}
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${evidence.ipfsHash}`}
                      alt={evidence.fileName}
                      onLoad={handleImageLoad}
                      className={`w-full h-auto max-h-96 object-contain ${
                        imageLoading ? "hidden" : ""
                      }`}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl text-neutral-600">
                        {evidence.fileType?.split("/")[1]?.toUpperCase() ||
                          "FILE"}
                      </span>
                    </div>
                    <p className="text-neutral-700 font-medium mb-2">
                      {evidence.fileName}
                    </p>
                    <p className="text-neutral-500 text-sm">
                      {evidence.fileType}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!evidence || downloadInProgress}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {downloadInProgress ? "Downloading..." : "Download"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
