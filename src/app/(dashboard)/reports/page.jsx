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
import ProtectedPage from "@/components/ProtectedPage";

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
    <ProtectedPage
      requiredRoles={["Investigator", "Forensic Analyst"]}
      pageName="Case Reports"
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl text-neutral-800 mb-2">
            Case Reports
          </h1>
          <p className="text-xs md:text-sm text-neutral-600">
            View all cases and their associated evidence records
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 w-full max-w-3xl">
          <div className="relative">
            <Search className="absolute left-4 top-2.5 md:top-3.5 w-4 md:w-5 h-4 md:h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3 md:space-y-4 w-full max-w-4xl">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-neutral-200 p-4 md:p-6 animate-pulse"
              >
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <AlertCircle className="w-10 md:w-12 h-10 md:h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2 text-sm md:text-base">
              No cases found
            </p>
            <p className="text-xs md:text-sm text-neutral-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by creating a new case"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 w-full max-w-4xl">
            {filteredCases.map((caseItem, index) => (
              <div
                // key={caseItem._id}
                key={caseItem._id || caseItem.id || `case-${index}`}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Case Header */}
                <button
                  onClick={() => router.push(`/reports/${caseItem._id}`)}
                  className="w-full p-3 md:p-6 flex items-start md:items-center justify-between gap-3 md:gap-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-semibold text-neutral-800 truncate">
                        {caseItem.title}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded whitespace-nowrap">
                        {caseItem.caseType}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-600 mb-2 truncate">
                      {caseItem.caseNumber} • Status: {caseItem.status}
                    </p>
                    <p className="text-xs md:text-sm text-neutral-500 line-clamp-1">
                      {caseItem.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 md:mt-3 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(caseItem.dateOpened)}
                        </span>
                      </div>
                      <div className="hidden sm:block">•</div>
                      <div className="truncate">
                        Jurisdiction: {caseItem.jurisdiction}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2 flex items-center gap-2 flex-shrink-0">
                    {loadingEvidence[caseItem._id] && (
                      <Loader className="w-4 h-4 text-neutral-400 animate-spin" />
                    )}
                    <ChevronRight
                      className={`w-4 md:w-5 h-4 md:h-5 text-neutral-400 transition-transform flex-shrink-0 ${
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
    </ProtectedPage>
  );
}
