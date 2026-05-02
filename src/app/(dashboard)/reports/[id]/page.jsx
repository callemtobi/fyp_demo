"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Download,
  Loader,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  User,
  Tag,
  Briefcase,
  Eye,
} from "lucide-react";
import jsPDF from "jspdf";

export default function CaseDetail() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id;

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloadingSummary, setDownloadingSummary] = useState(false);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/cases/${caseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          setCaseData(response.data.data);
        } else {
          setError("Failed to load case details");
        }
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Error loading case details. Please try again.");
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generatePDFReport = async () => {
    if (!caseData) return;

    try {
      setGenerating(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(25, 118, 210);
      doc.text("FORENSIC CASE REPORT", margin, yPosition);
      yPosition += 15;

      // Separator line
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(1);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Case Information Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("CASE INFORMATION", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      const caseFields = [
        ["Case Number:", caseData.caseNumber],
        ["Title:", caseData.title],
        ["Type:", caseData.caseType.toUpperCase()],
        ["Status:", caseData.status.toUpperCase()],
        ["Jurisdiction:", caseData.jurisdiction],
        ["Date Opened:", formatDate(caseData.dateOpened)],
      ];

      caseFields.forEach(([label, value]) => {
        doc.setFont(undefined, "bold");
        doc.text(label, margin, yPosition);
        doc.setFont(undefined, "normal");
        doc.text(String(value || "-"), margin + 50, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Description Section
      if (caseData.description) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("DESCRIPTION", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        const descLines = doc.splitTextToSize(
          caseData.description,
          contentWidth,
        );
        doc.text(descLines, margin, yPosition);
        yPosition += descLines.length * 6 + 5;
      }

      // Crime Details
      if (caseData.crime && Object.keys(caseData.crime).length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("CRIME DETAILS", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        const crimeFields = [
          ["Offense Type:", caseData.crime.offenseType || "-"],
          ["Classification:", caseData.crime.classification || "-"],
          ["Location:", caseData.crime.location || "-"],
          [
            "Occurred At:",
            caseData.crime.occurredAt
              ? formatDate(caseData.crime.occurredAt)
              : "-",
          ],
        ];

        crimeFields.forEach(([label, value]) => {
          doc.setFont(undefined, "bold");
          doc.text(label, margin, yPosition);
          doc.setFont(undefined, "normal");
          doc.text(String(value), margin + 50, yPosition);
          yPosition += 6;
        });

        yPosition += 5;
      }

      // Victim Information
      if (caseData.victim && Object.keys(caseData.victim).length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("VICTIM INFORMATION", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        const victimFields = [
          ["Name:", caseData.victim.fullName || "-"],
          ["Phone:", caseData.victim.contact?.phone || "-"],
          ["Email:", caseData.victim.contact?.email || "-"],
        ];

        victimFields.forEach(([label, value]) => {
          doc.setFont(undefined, "bold");
          doc.text(label, margin, yPosition);
          doc.setFont(undefined, "normal");
          doc.text(String(value), margin + 50, yPosition);
          yPosition += 6;
        });

        yPosition += 5;
      }

      // Suspect Information
      if (caseData.suspect && Object.keys(caseData.suspect).length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("SUSPECT INFORMATION", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        const suspectFields = [
          ["Name:", caseData.suspect.fullName || "-"],
          ["Status:", caseData.suspect.status || "-"],
          ["Phone:", caseData.suspect.contact?.phone || "-"],
          ["Email:", caseData.suspect.contact?.email || "-"],
        ];

        suspectFields.forEach(([label, value]) => {
          doc.setFont(undefined, "bold");
          doc.text(label, margin, yPosition);
          doc.setFont(undefined, "normal");
          doc.text(String(value), margin + 50, yPosition);
          yPosition += 6;
        });

        yPosition += 5;
      }

      // Witness Information
      if (caseData.witness && Object.keys(caseData.witness).length > 0) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("WITNESS INFORMATION", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        const witnessFields = [
          ["Name:", caseData.witness.fullName || "-"],
          ["Phone:", caseData.witness.contact?.phone || "-"],
          ["Email:", caseData.witness.contact?.email || "-"],
        ];

        witnessFields.forEach(([label, value]) => {
          doc.setFont(undefined, "bold");
          doc.text(label, margin, yPosition);
          doc.setFont(undefined, "normal");
          doc.text(String(value), margin + 50, yPosition);
          yPosition += 6;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const footerY = pageHeight - 10;
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Case: ${caseData.caseNumber}`,
        margin,
        footerY,
      );

      // Download PDF
      const fileName = `Case-${caseData.caseNumber}-Report-${Date.now()}.pdf`;
      doc.save(fileName);

      // Log report generation to backend for audit trail
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:8000/api/reports/log",
          {
            caseId: caseData._id,
            reportName: fileName,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (logErr) {
        console.warn("Report generated but logging failed:", logErr);
      }

      setGenerating(false);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF report");
      setGenerating(false);
    }
  };

  const downloadSummary = async () => {
    if (!caseData) return;

    try {
      setDownloadingSummary(true);

      // Use the stored summary from caseAnalysisSummary or generate a basic summary
      let summary = "";

      const caseSummary = caseData.caseAnalysisSummary?.caseSummary || "";
      const evidenceSummary =
        caseData.caseAnalysisSummary?.evidenceSummary || "";

      if (caseSummary) {
        summary += caseSummary + "\n";
      }

      if (evidenceSummary) {
        summary += "\n" + evidenceSummary;
      }

      if (!summary) {
        // Generate basic summary if not available
        summary = `CASE SUMMARY
        
Case Number: ${caseData.caseNumber}
Title: ${caseData.title}
Type: ${caseData.caseType}
Status: ${caseData.status}
Jurisdiction: ${caseData.jurisdiction}
Date Opened: ${formatDate(caseData.dateOpened)}

Description:
${caseData.description}

Evidence Count: ${caseData.evidence?.length || 0}`;
      }

      // Create a text file and download it
      const element = document.createElement("a");
      const file = new Blob([summary], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `Case-${caseData.caseNumber}-Summary-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloadingSummary(false);
    } catch (err) {
      console.error("Error downloading summary:", err);
      setError("Failed to download summary");
      setDownloadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error || "Case not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-800 mb-2">
              {caseData.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {caseData.caseType}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {caseData.status}
              </span>
            </div>
          </div>
          <button
            onClick={generatePDFReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </button>
          <button
            onClick={downloadSummary}
            disabled={downloadingSummary}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-green-400"
          >
            {downloadingSummary ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Details Card */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Case Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Case Number</p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {caseData.caseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Jurisdiction</p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {caseData.jurisdiction}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-2">Description</p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {caseData.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 pt-2 border-t">
                <Calendar className="w-4 h-4" />
                Opened on {formatDate(caseData.dateOpened)}
              </div>
            </div>
          </div>

          {/* Crime Information */}
          {caseData.crime && Object.keys(caseData.crime).length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Crime Information
              </h2>
              <div className="space-y-3">
                {caseData.crime.offenseType && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">
                      Offense Type
                    </p>
                    <p className="text-sm text-neutral-800">
                      {caseData.crime.offenseType}
                    </p>
                  </div>
                )}
                {caseData.crime.classification && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">
                      Classification
                    </p>
                    <p className="text-sm text-neutral-800">
                      {caseData.crime.classification}
                    </p>
                  </div>
                )}
                {caseData.crime.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-neutral-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-600">Location</p>
                      <p className="text-sm text-neutral-800">
                        {caseData.crime.location}
                      </p>
                    </div>
                  </div>
                )}
                {caseData.crime.occurredAt && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Occurred At</p>
                    <p className="text-sm text-neutral-800">
                      {formatDate(caseData.crime.occurredAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Victim Information */}
          {caseData.victim && Object.keys(caseData.victim).length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Victim Information
              </h2>
              <div className="space-y-3">
                {caseData.victim.fullName && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Name</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.victim.fullName}
                    </p>
                  </div>
                )}
                {caseData.victim.contact?.phone && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Phone</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.victim.contact.phone}
                    </p>
                  </div>
                )}
                {caseData.victim.contact?.email && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Email</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.victim.contact.email}
                    </p>
                  </div>
                )}
                {caseData.victim.statement && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Statement</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {caseData.victim.statement}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suspect Information */}
          {caseData.suspect && Object.keys(caseData.suspect).length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Suspect Information
              </h2>
              <div className="space-y-3">
                {caseData.suspect.fullName && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Name</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.suspect.fullName}
                    </p>
                  </div>
                )}
                {caseData.suspect.status && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Status</p>
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                      {caseData.suspect.status}
                    </span>
                  </div>
                )}
                {caseData.suspect.contact?.phone && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Phone</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.suspect.contact.phone}
                    </p>
                  </div>
                )}
                {caseData.suspect.contact?.email && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Email</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.suspect.contact.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Witness Information */}
          {caseData.witness && Object.keys(caseData.witness).length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Witness Information
              </h2>
              <div className="space-y-3">
                {caseData.witness.fullName && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Name</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.witness.fullName}
                    </p>
                  </div>
                )}
                {caseData.witness.contact?.phone && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Phone</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.witness.contact.phone}
                    </p>
                  </div>
                )}
                {caseData.witness.contact?.email && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Email</p>
                    <p className="text-sm text-neutral-800">
                      {caseData.witness.contact.email}
                    </p>
                  </div>
                )}
                {caseData.witness.testimony && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Testimony</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {caseData.witness.testimony}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-800 mb-4">
              Quick Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-600 mb-1">Case Type</p>
                <p className="text-sm font-semibold text-blue-600">
                  {caseData.caseType}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-600 mb-1">Status</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {caseData.status}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs text-neutral-600 mb-2">Evidence Count</p>
                <p className="text-2xl font-semibold text-neutral-800 mb-4">
                  {caseData.evidence?.length || 0}
                </p>
                {caseData.evidence && caseData.evidence.length > 0 && (
                  <button
                    onClick={() => router.push(`/records`)}
                    className="w-full px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {caseData.tags && caseData.tags.length > 0 && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
