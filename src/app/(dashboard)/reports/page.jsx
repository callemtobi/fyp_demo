"use client";

import axios from "axios";
import {
  Search,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Reports() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState({});

  // Fetch all cases
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/cases", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setCases(response.data.data);
          setFilteredCases(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = cases.filter(
      (caseItem) =>
        caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCases(filtered);
  }, [searchTerm, cases]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Case Reports</h1>
        <p className="text-sm text-neutral-600">
          View all cases and their associated evidence records
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cases by name, number, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg bg-white text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4 max-w-4xl">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-neutral-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">No cases found</p>
          <p className="text-sm text-neutral-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Start by creating a new case"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem._id}
              className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Case Header */}
              <button
                onClick={() => router.push(`/reports/${caseItem._id}`)}
                className="w-full p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {caseItem.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {caseItem.caseType}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">
                    {caseItem.caseNumber} • Status: {caseItem.status}
                  </p>
                  <p className="text-sm text-neutral-500 line-clamp-1">
                    {caseItem.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(caseItem.dateOpened)}
                    </div>
                    <div>Jurisdiction: {caseItem.jurisdiction}</div>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  {loadingEvidence[caseItem._id] && (
                    <Loader className="w-4 h-4 text-neutral-400 animate-spin" />
                  )}
                  <ChevronRight
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      expandedCaseId === caseItem._id ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
