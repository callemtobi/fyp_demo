"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";
import axios from "axios";

export default function CasePage({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedCaseDetails, setSavedCaseDetails] = useState(null);

  // Case Information
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jurisdiction: "",
    caseType: "other",
    status: "open",
    assignedOfficer: "",
  });

  // Initial Crime Information
  const [crime, setCrime] = useState({
    offenseType: "",
    classification: "misdemeanor",
    location: "",
    occurredAt: "",
  });

  // Initial Victim Information
  const [victim, setVictim] = useState({
    fullName: "",
    phone: "",
    email: "",
    statement: "",
    injuryDescription: "",
  });

  // Initial Witness Information
  const [witness, setWitness] = useState({
    fullName: "",
    phone: "",
    email: "",
    testimony: "",
  });

  // Initial Suspect Information
  const [suspect, setSuspect] = useState({
    fullName: "",
    status: "person_of_interest",
    alibi: "",
    phone: "",
    email: "",
  });

  const [officers, setOfficers] = useState([]);

  // Fetch officers on mount
  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/auth/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const officerList =
        response.data?.data || response.data?.users || response.data || [];
      setOfficers(Array.isArray(officerList) ? officerList : []);
    } catch (err) {
      console.error("Error fetching officers:", err);
      setOfficers([]);
      setError("Unable to fetch officers. You can still create a case.");
    }
  };

  const handleCaseChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCrimeChange = (e) => {
    const { name, value } = e.target;
    setCrime({ ...crime, [name]: value });
  };

  const handleVictimChange = (e) => {
    const { name, value } = e.target;
    setVictim({ ...victim, [name]: value });
  };

  const handleWitnessChange = (e) => {
    const { name, value } = e.target;
    setWitness({ ...witness, [name]: value });
  };

  const handleSuspectChange = (e) => {
    const { name, value } = e.target;
    setSuspect({ ...suspect, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setSavedCaseDetails(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Case title is required");
      }
      if (!formData.jurisdiction.trim()) {
        throw new Error("Jurisdiction is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        jurisdiction: formData.jurisdiction,
        caseType: formData.caseType,
        status: formData.status,
      };
      if (formData.assignedOfficer) {
        payload.assignedOfficer = formData.assignedOfficer;
      }

      // Add crime info if provided
      if (crime.offenseType) {
        payload.crime = crime;
      }

      // Add victim info if provided
      if (victim.fullName) {
        payload.victim = {
          fullName: victim.fullName,
          contact: {
            phone: victim.phone,
            email: victim.email,
          },
          statement: victim.statement,
          injuryDescription: victim.injuryDescription,
        };
      }

      // Add witness info if provided
      if (witness.fullName) {
        payload.witness = {
          fullName: witness.fullName,
          contact: {
            phone: witness.phone,
            email: witness.email,
          },
          testimony: witness.testimony,
        };
      }

      // Add suspect info if provided
      if (suspect.fullName) {
        payload.suspect = {
          fullName: suspect.fullName,
          status: suspect.status,
          alibi: suspect.alibi,
          contact: {
            phone: suspect.phone,
            email: suspect.email,
          },
        };
      }

      const response = await axios.post(
        "http://localhost:8000/api/cases",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      const createdCase = response.data?.data;
      setSavedCaseDetails({
        title: createdCase?.title || formData.title,
        caseNumber: createdCase?.caseNumber || "",
      });
      setSuccess(true);
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          jurisdiction: "",
          caseType: "other",
          status: "open",
          assignedOfficer: "",
        });
        setCrime({
          offenseType: "",
          classification: "misdemeanor",
          location: "",
          occurredAt: "",
        });
        setVictim({
          fullName: "",
          phone: "",
          email: "",
          statement: "",
          injuryDescription: "",
        });
        setWitness({
          fullName: "",
          phone: "",
          email: "",
          testimony: "",
        });
        setSuspect({
          fullName: "",
          status: "person_of_interest",
          alibi: "",
          phone: "",
          email: "",
        });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Error creating case",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- SHARED STYLES (from uploads styling) ---
  const baseInput =
    "block w-full rounded-md border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100 disabled:opacity-75";
  const baseSelect =
    "block w-full rounded-md border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100 disabled:opacity-75";
  const baseTextarea =
    "block w-full rounded-md border border-neutral-300 bg-white py-2 px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-neutral-100 disabled:opacity-75 resize-none";
  // ---s

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl text-neutral-800 mb-2">
          Create Case
        </h1>
        <p className="text-xs md:text-sm text-neutral-500">
          Create a case by filling the form below.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-green-700 font-medium break-words">
              Case saved successfully: {savedCaseDetails?.title}
              {savedCaseDetails?.caseNumber
                ? ` (${savedCaseDetails.caseNumber})`
                : ""}
            </p>
          </div>
        )}

        {loading && (
          <div className="mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-blue-800 font-medium">
              Saving case{formData.title ? ` "${formData.title}"` : ""}...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-red-700 font-medium break-words">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Case Information Section */}
          <div>
            <div className="bg-white rounded-lg md:rounded-xl border border-neutral-200 p-4 md:p-6 mb-6 shadow-sm">
              {/* Case Title */}
              <div className="mb-4">
                <label className="text-xs md:text-sm font-medium block text-neutral-700 mb-2">
                  Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleCaseChange}
                  placeholder="e.g., Robbery Investigation - Downtown"
                  className={baseInput}
                  required
                />
              </div>

              {/* Jurisdiction */}
              <div className="mb-4">
                <label className="text-xs md:text-sm font-medium block text-neutral-700 mb-2">
                  Jurisdiction <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={handleCaseChange}
                  placeholder="e.g., New York Police Department"
                  className={baseInput}
                  required
                />
              </div>

              {/* Assigned Officer */}
              <div className="mb-4">
                <label className="text-xs md:text-sm font-medium block text-neutral-700 mb-2">
                  Assigned Officer (Optional)
                </label>
                <select
                  name="assignedOfficer"
                  value={formData.assignedOfficer}
                  onChange={handleCaseChange}
                  className={baseSelect}
                >
                  <option value="">Leave unassigned</option>
                  {officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.username || officer.name || "Unknown"} (
                      {officer.email || "No email"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Type & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs md:text-sm font-medium block text-neutral-700 mb-2">
                    Case Type
                  </label>
                  <select
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleCaseChange}
                    className={baseSelect}
                    disabled={loading}
                  >
                    <option value="other">Other</option>
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                    <option value="corporate">Corporate</option>
                    <option value="cyber">Cyber</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs md:text-sm font-medium block text-neutral-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleCaseChange}
                    className={baseSelect}
                    disabled={loading}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleCaseChange}
                  placeholder="Detailed description of the case..."
                  rows={4}
                  className={baseTextarea}
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="space-y-4 md:space-y-6">
            {/* Crime Information */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="px-4 md:px-6 py-3 md:py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-sm md:text-base text-neutral-900">
                  Crime Information (Optional)
                </span>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Offense Type
                    </label>
                    <input
                      type="text"
                      name="offenseType"
                      value={crime.offenseType}
                      onChange={handleCrimeChange}
                      placeholder="e.g., Robbery, Theft"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Classification
                    </label>
                    <select
                      name="classification"
                      value={crime.classification}
                      onChange={handleCrimeChange}
                      className={baseSelect}
                    >
                      <option value="misdemeanor">Misdemeanor</option>
                      <option value="felony">Felony</option>
                      <option value="infraction">Infraction</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={crime.location}
                      onChange={handleCrimeChange}
                      placeholder="Crime location"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Date Occurred
                    </label>
                    <input
                      type="datetime-local"
                      name="occurredAt"
                      value={crime.occurredAt}
                      onChange={handleCrimeChange}
                      className={baseInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Victim Information */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="px-4 md:px-6 py-3 md:py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-sm md:text-base text-neutral-900">
                  Victim Information (Optional)
                </span>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={victim.fullName}
                      onChange={handleVictimChange}
                      placeholder="Victim full name"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={victim.phone}
                      onChange={handleVictimChange}
                      placeholder="Phone number"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={victim.email}
                      onChange={handleVictimChange}
                      placeholder="Email address"
                      className={baseInput}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Statement
                    </label>
                    <textarea
                      name="statement"
                      value={victim.statement}
                      onChange={handleVictimChange}
                      placeholder="Victim statement..."
                      rows={3}
                      className={baseTextarea}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Injury Description
                    </label>
                    <textarea
                      name="injuryDescription"
                      value={victim.injuryDescription}
                      onChange={handleVictimChange}
                      placeholder="Description of injuries..."
                      rows={3}
                      className={baseTextarea}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Witness Information */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="px-4 md:px-6 py-3 md:py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-sm md:text-base text-neutral-900">
                  Witness Information (Optional)
                </span>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={witness.fullName}
                      onChange={handleWitnessChange}
                      placeholder="Witness full name"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={witness.phone}
                      onChange={handleWitnessChange}
                      placeholder="Phone number"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={witness.email}
                      onChange={handleWitnessChange}
                      placeholder="Email address"
                      className={baseInput}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Testimony
                    </label>
                    <textarea
                      name="testimony"
                      value={witness.testimony}
                      onChange={handleWitnessChange}
                      placeholder="Witness testimony..."
                      rows={3}
                      className={baseTextarea}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Suspect Information */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="px-4 md:px-6 py-3 md:py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-sm md:text-base text-neutral-900">
                  Suspect Information (Optional)
                </span>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={suspect.fullName}
                      onChange={handleSuspectChange}
                      placeholder="Suspect full name"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={suspect.status}
                      onChange={handleSuspectChange}
                      className={baseSelect}
                    >
                      <option value="person_of_interest">
                        Person of Interest
                      </option>
                      <option value="suspect">Suspect</option>
                      <option value="arrested">Arrested</option>
                      <option value="charged">Charged</option>
                      <option value="cleared">Cleared</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={suspect.phone}
                      onChange={handleSuspectChange}
                      placeholder="Phone number"
                      className={baseInput}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={suspect.email}
                      onChange={handleSuspectChange}
                      placeholder="Email address"
                      className={baseInput}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-xs md:text-sm text-neutral-700 mb-2">
                      Alibi
                    </label>
                    <textarea
                      name="alibi"
                      value={suspect.alibi}
                      onChange={handleSuspectChange}
                      placeholder="Suspect's alibi..."
                      rows={2}
                      className={baseTextarea}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 sm:gap-4 pt-4 md:pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 md:py-3 rounded-lg shadow transition flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span className="hidden sm:inline">Creating Case...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                "Create Case"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
