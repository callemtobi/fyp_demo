"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  AlertCircle,
  Loader,
  Download,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/lib/toastConfig";

// Simple debounce implementation
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

export default function CaseComparison() {
  const [selectedCase1, setSelectedCase1] = useState(null);
  const [selectedCase2, setSelectedCase2] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [cases1, setCases1] = useState([]);
  const [cases2, setCases2] = useState([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);

  // Debounced search function
  const performSearchDirect = useCallback(
    async (query, setCases, setSearching) => {
      if (!query.trim()) {
        setCases([]);
        return;
      }

      setSearching(true);
      try {
        const response = await axios.get("http://localhost:8000/api/cases", {
          params: {
            search: query,
            limit: 10,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setCases(response.data?.data || []);
      } catch (err) {
        console.error("Error searching cases:", err);
        setCases([]);
      } finally {
        setSearching(false);
      }
    },
    [],
  );

  const performSearch1 = useDebounce(
    (query) => performSearchDirect(query, setCases1, setSearching1),
    500,
  );
  const performSearch2 = useDebounce(
    (query) => performSearchDirect(query, setCases2, setSearching2),
    500,
  );

  const handleSearch1Change = (e) => {
    const query = e.target.value;
    setSearchQuery1(query);
    performSearch1(query);
  };

  const handleSearch2Change = (e) => {
    const query = e.target.value;
    setSearchQuery2(query);
    performSearch2(query);
  };

  const handleSelectCase1 = (caseData) => {
    setSelectedCase1(caseData);
    setSearchQuery1("");
    setCases1([]);
  };

  const handleSelectCase2 = (caseData) => {
    setSelectedCase2(caseData);
    setSearchQuery2("");
    setCases2([]);
  };

  const handleCompare = async () => {
    if (!selectedCase1 || !selectedCase2) {
      const errorMsg = "Please select both cases";
      setError(errorMsg);
      showErrorToast(errorMsg);
      return;
    }

    setLoading(true);
    setError("");
    setComparisonResult(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cases/compare",
        {
          case1Id: selectedCase1._id,
          case2Id: selectedCase2._id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      setComparisonResult(response.data?.data);
      showSuccessToast("Cases compared successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Error comparing cases";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!comparisonResult || !selectedCase1 || !selectedCase2) {
      const errorMsg = "Missing data for PDF generation";
      setError(errorMsg);
      showErrorToast(errorMsg);
      return;
    }

    setDownloadingPDF(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cases/comparison/download",
        {
          case1Id: selectedCase1._id,
          case2Id: selectedCase2._id,
          comparisonResult: comparisonResult.comparisonResult,
          similarityScore: comparisonResult.similarityScore,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob",
        },
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `comparison_${selectedCase1.caseNumber}_vs_${selectedCase2.caseNumber}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccessToast("PDF downloaded successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Error downloading PDF";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const baseInput =
    "w-full rounded-md border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Case Comparison</h1>
        <p className="text-sm text-neutral-500">
          Search and compare cases to identify similarities using AI analysis
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Case Selection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Case 1 Selection */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Select First Case
            </h2>

            {!selectedCase1 ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search cases by title, description, or case number..."
                    value={searchQuery1}
                    onChange={handleSearch1Change}
                    className={`pl-10 ${baseInput}`}
                  />
                </div>

                {searching1 && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                )}

                {cases1.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cases1.map((caseItem) => (
                      <button
                        key={caseItem._id}
                        onClick={() => handleSelectCase1(caseItem)}
                        className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <p className="font-medium text-neutral-900 text-sm">
                          {caseItem.title}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {caseItem.caseNumber}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery1 && cases1.length === 0 && !searching1 && (
                  <p className="text-sm text-neutral-500">No cases found</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {selectedCase1.title}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      {selectedCase1.caseNumber}
                    </p>
                    <p className="text-xs text-neutral-600 mt-2">
                      Type: {selectedCase1.caseType}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCase1(null)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Case 2 Selection */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Select Second Case
            </h2>

            {!selectedCase2 ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search cases by title, description, or case number..."
                    value={searchQuery2}
                    onChange={handleSearch2Change}
                    className={`pl-10 ${baseInput}`}
                  />
                </div>

                {searching2 && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                )}

                {cases2.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cases2.map((caseItem) => (
                      <button
                        key={caseItem._id}
                        onClick={() => handleSelectCase2(caseItem)}
                        className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-blue-500 hover:bg-blue-50 transition"
                      >
                        <p className="font-medium text-neutral-900 text-sm">
                          {caseItem.title}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {caseItem.caseNumber}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery2 && cases2.length === 0 && !searching2 && (
                  <p className="text-sm text-neutral-500">No cases found</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {selectedCase2.title}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      {selectedCase2.caseNumber}
                    </p>
                    <p className="text-xs text-neutral-600 mt-2">
                      Type: {selectedCase2.caseType}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCase2(null)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compare Button */}
        {selectedCase1 && selectedCase2 && (
          <div className="mb-8 text-center">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg shadow transition inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing Cases...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Find Similarities
                </>
              )}
            </button>
          </div>
        )}

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Similarity Score */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Similarity Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 border border-neutral-200">
                  <p className="text-neutral-600 text-sm mb-2">
                    Overall Similarity
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-bold ${
                        comparisonResult.similarityScore >= 75
                          ? "text-green-600"
                          : comparisonResult.similarityScore >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {comparisonResult.similarityScore}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-neutral-200">
                  <p className="text-neutral-600 text-sm mb-2">Case 1</p>
                  <p className="font-medium text-neutral-900">
                    {comparisonResult.case1.caseNumber}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {comparisonResult.case1.title}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-neutral-200">
                  <p className="text-neutral-600 text-sm mb-2">Case 2</p>
                  <p className="font-medium text-neutral-900">
                    {comparisonResult.case2.caseNumber}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    {comparisonResult.case2.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Detailed Analysis
              </h2>
              <div className="prose prose-sm max-w-none">
                <div className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                  {comparisonResult.comparisonResult}
                </div>
              </div>
            </div>

            {/* Download PDF Button */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg shadow transition inline-flex items-center gap-2"
              >
                {downloadingPDF ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Comparison Report (PDF)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparisonResult && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">
              Select two cases and click "Find Similarities" to begin comparison
            </p>
            <p className="text-sm text-neutral-500">
              Our AI will analyze both cases and identify patterns, connections,
              and shared characteristics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
