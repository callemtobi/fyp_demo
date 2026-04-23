"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, X, Loader } from "lucide-react";
import axios from "axios";

export default function CasePage({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Case Information
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jurisdiction: "",
    priority: "medium",
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
  const [showCrime, setShowCrime] = useState(false);
  const [showVictim, setShowVictim] = useState(false);
  const [showWitness, setShowWitness] = useState(false);
  const [showSuspect, setShowSuspect] = useState(false);

  // Fetch officers on mount
  //   useEffect(() => {
  //     fetchOfficers();
  //   }, []);

  //   const fetchOfficers = async () => {
  //     try {
  //       const response = await axios.get("/api/users", {
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       });
  //       setOfficers(response.data.users || []);
  //     } catch (err) {
  //       console.error("Error fetching officers:", err);
  //     }
  //   };

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

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Case title is required");
      }
      if (!formData.jurisdiction.trim()) {
        throw new Error("Jurisdiction is required");
      }
      if (!formData.assignedOfficer) {
        throw new Error("Assigned officer is required");
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        jurisdiction: formData.jurisdiction,
        priority: formData.priority,
        assignedOfficer: formData.assignedOfficer,
      };

      // Add crime info if provided
      if (showCrime && crime.offenseType) {
        payload.crime = crime;
      }

      // Add victim info if provided
      if (showVictim && victim.fullName) {
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
      if (showWitness && witness.fullName) {
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
      if (showSuspect && suspect.fullName) {
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

      const response = await axios.post("/api/cases", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
          priority: "medium",
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Create Case</h1>
        <p className="text-sm text-neutral-500">
          Create a case by filling the form below.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">
              Case created successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Case Information Section */}
          <div>
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
              {/* Case Title */}
              <div className="mb-4">
                <label className="text-sm font-medium block text-neutral-700 mb-1">
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
                <label className="text-sm font-medium block text-neutral-700 mb-1">
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

              {/* Priority */}
              <div className="mb-4">
                <label className="text-sm font-medium block text-neutral-700 mb-1">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleCaseChange}
                  className={baseSelect}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Assigned Officer */}
              <div className="mb-4">
                <label className="text-sm font-medium block text-neutral-700 mb-1">
                  Assigned Officer <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignedOfficer"
                  value={formData.assignedOfficer}
                  onChange={handleCaseChange}
                  className={baseSelect}
                  required
                >
                  <option value="">Select an officer</option>
                  {officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.username} ({officer.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-sm text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleCaseChange}
                  placeholder="Detailed description of the case..."
                  rows={4}
                  className={baseTextarea}
                />
              </div>
            </div>
          </div>

          {/* Additional Sections. No dropdown, always expanded */}
          <div className="space-y-6">
            {/* Crime Information */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-neutral-900">
                  Crime Information (Optional)
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-neutral-900">
                  Victim Information (Optional)
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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

                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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

                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-neutral-900">
                  Witness Information (Optional)
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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

                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
              <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
                <span className="font-medium text-neutral-900">
                  Suspect Information (Optional)
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                      <option value="accused">Accused</option>
                      <option value="convicted">Convicted</option>
                      <option value="acquitted">Acquitted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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

                  <div className="md:col-span-2">
                    <label className="block font-medium text-sm text-neutral-700 mb-1">
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
          <div className="flex gap-4 pt-6 border-t border-neutral-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Case...
                </>
              ) : (
                "Create Case"
              )}
            </button>
            {/* <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium py-3 rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );

  //   return (
  //     <div className="p-8">
  //       {/* HEAder */}
  //       <div className="mb-8">
  //         <h1 className="text-2xl text-neutral-800 mb-2">Create Case</h1>
  //         <p className="text-sm text-neutral-500">
  //           Create a case by filling the form below.
  //         </p>
  //       </div>

  //       <div className="max-w-3xl mx-auto">
  //         {/* Success Message */}
  //         {success && (
  //           <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex items-center gap-3">
  //             <CheckCircle2 className="w-5 h-5 text-green-400" />
  //             <p className="text-green-400 font-medium">
  //               Case created successfully!
  //             </p>
  //           </div>
  //         )}

  //         {/* Error Message */}
  //         {error && (
  //           <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3">
  //             <AlertCircle className="w-5 h-5 text-red-400" />
  //             <p className="text-red-400 font-medium">{error}</p>
  //           </div>
  //         )}

  //         <form onSubmit={handleSubmit} className="space-y-8">
  //           {/* Case Information Section */}
  //           <div>
  //             <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
  //               {/* Case Title */}
  //               <div className="md:col-span-2">
  //                 <label className="text-sm font-medium block text-neutral-600 mb-2">
  //                   Case Title <span className="text-red-400">*</span>
  //                 </label>
  //                 <input
  //                   type="text"
  //                   name="title"
  //                   value={formData.title}
  //                   onChange={handleCaseChange}
  //                   placeholder="e.g., Robbery Investigation - Downtown"
  //                   className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                   required
  //                 />
  //               </div>

  //               {/* Jurisdiction */}
  //               <div>
  //                 <label className="text-sm font-medium block text-neutral-600 mb-2">
  //                   Jurisdiction <span className="text-red-400">*</span>
  //                 </label>
  //                 <input
  //                   type="text"
  //                   name="jurisdiction"
  //                   value={formData.jurisdiction}
  //                   onChange={handleCaseChange}
  //                   placeholder="e.g., New York Police Department"
  //                   className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                   required
  //                 />
  //               </div>

  //               {/* Priority */}
  //               <div>
  //                 <label className="text-sm font-medium block text-neutral-600 mb-2">
  //                   Priority Level
  //                 </label>
  //                 <select
  //                   name="priority"
  //                   value={formData.priority}
  //                   onChange={handleCaseChange}
  //                   className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  //                 >
  //                   <option value="low">Low</option>
  //                   <option value="medium">Medium</option>
  //                   <option value="high">High</option>
  //                   <option value="critical">Critical</option>
  //                 </select>
  //               </div>

  //               {/* Assigned Officer */}
  //               <div className="md:col-span-2">
  //                 <label className="text-sm font-medium block text-neutral-600 mb-2">
  //                   Assigned Officer <span className="text-red-400">*</span>
  //                 </label>
  //                 <select
  //                   name="assignedOfficer"
  //                   value={formData.assignedOfficer}
  //                   onChange={handleCaseChange}
  //                   className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  //                   required
  //                 >
  //                   <option value="">Select an officer</option>
  //                   {officers.map((officer) => (
  //                     <option key={officer._id} value={officer._id}>
  //                       {officer.username} ({officer.email})
  //                     </option>
  //                   ))}
  //                 </select>
  //               </div>

  //               {/* Description */}
  //               <div className="md:col-span-2">
  //                 <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                   Description
  //                 </label>
  //                 <textarea
  //                   name="description"
  //                   value={formData.description}
  //                   onChange={handleCaseChange}
  //                   placeholder="Detailed description of the case..."
  //                   rows={4}
  //                   className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
  //                 />
  //               </div>
  //             </div>
  //           </div>

  //           {/* Optional Sections */}
  //           <div className="space-y-6">
  //             {/* Crime Information */}
  //             <div className="border border-white/10 rounded-lg overflow-hidden">
  //               <button
  //                 type="button"
  //                 onClick={() => setShowCrime(!showCrime)}
  //                 className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition flex items-center justify-between text-white font-medium"
  //               >
  //                 <span>Crime Information (Optional)</span>
  //                 <span
  //                   className={`transform transition ${showCrime ? "rotate-180" : ""}`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {showCrime && (
  //                 <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Offense Type
  //                       </label>
  //                       <input
  //                         type="text"
  //                         name="offenseType"
  //                         value={crime.offenseType}
  //                         onChange={handleCrimeChange}
  //                         placeholder="e.g., Robbery, Theft"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Classification
  //                       </label>
  //                       <select
  //                         name="classification"
  //                         value={crime.classification}
  //                         onChange={handleCrimeChange}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  //                       >
  //                         <option value="misdemeanor">Misdemeanor</option>
  //                         <option value="felony">Felony</option>
  //                         <option value="infraction">Infraction</option>
  //                         <option value="other">Other</option>
  //                       </select>
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Location
  //                       </label>
  //                       <input
  //                         type="text"
  //                         name="location"
  //                         value={crime.location}
  //                         onChange={handleCrimeChange}
  //                         placeholder="Crime location"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Date Occurred
  //                       </label>
  //                       <input
  //                         type="datetime-local"
  //                         name="occurredAt"
  //                         value={crime.occurredAt}
  //                         onChange={handleCrimeChange}
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Victim Information */}
  //             <div className="border border-white/10 rounded-lg overflow-hidden">
  //               <button
  //                 type="button"
  //                 onClick={() => setShowVictim(!showVictim)}
  //                 className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition flex items-center justify-between text-white font-medium"
  //               >
  //                 <span>Victim Information (Optional)</span>
  //                 <span
  //                   className={`transform transition ${showVictim ? "rotate-180" : ""}`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {showVictim && (
  //                 <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Full Name
  //                       </label>
  //                       <input
  //                         type="text"
  //                         name="fullName"
  //                         value={victim.fullName}
  //                         onChange={handleVictimChange}
  //                         placeholder="Victim full name"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Phone
  //                       </label>
  //                       <input
  //                         type="tel"
  //                         name="phone"
  //                         value={victim.phone}
  //                         onChange={handleVictimChange}
  //                         placeholder="Phone number"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Email
  //                       </label>
  //                       <input
  //                         type="email"
  //                         name="email"
  //                         value={victim.email}
  //                         onChange={handleVictimChange}
  //                         placeholder="Email address"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Statement
  //                       </label>
  //                       <textarea
  //                         name="statement"
  //                         value={victim.statement}
  //                         onChange={handleVictimChange}
  //                         placeholder="Victim statement..."
  //                         rows={3}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
  //                       />
  //                     </div>

  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Injury Description
  //                       </label>
  //                       <textarea
  //                         name="injuryDescription"
  //                         value={victim.injuryDescription}
  //                         onChange={handleVictimChange}
  //                         placeholder="Description of injuries..."
  //                         rows={3}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Witness Information */}
  //             <div className="border border-white/10 rounded-lg overflow-hidden">
  //               <button
  //                 type="button"
  //                 onClick={() => setShowWitness(!showWitness)}
  //                 className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition flex items-center justify-between text-white font-medium"
  //               >
  //                 <span>Witness Information (Optional)</span>
  //                 <span
  //                   className={`transform transition ${showWitness ? "rotate-180" : ""}`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {showWitness && (
  //                 <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Full Name
  //                       </label>
  //                       <input
  //                         type="text"
  //                         name="fullName"
  //                         value={witness.fullName}
  //                         onChange={handleWitnessChange}
  //                         placeholder="Witness full name"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Phone
  //                       </label>
  //                       <input
  //                         type="tel"
  //                         name="phone"
  //                         value={witness.phone}
  //                         onChange={handleWitnessChange}
  //                         placeholder="Phone number"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Email
  //                       </label>
  //                       <input
  //                         type="email"
  //                         name="email"
  //                         value={witness.email}
  //                         onChange={handleWitnessChange}
  //                         placeholder="Email address"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Testimony
  //                       </label>
  //                       <textarea
  //                         name="testimony"
  //                         value={witness.testimony}
  //                         onChange={handleWitnessChange}
  //                         placeholder="Witness testimony..."
  //                         rows={3}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>

  //             {/* Suspect Information */}
  //             <div className="border border-white/10 rounded-lg overflow-hidden">
  //               <button
  //                 type="button"
  //                 onClick={() => setShowSuspect(!showSuspect)}
  //                 className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 transition flex items-center justify-between text-white font-medium"
  //               >
  //                 <span>Suspect Information (Optional)</span>
  //                 <span
  //                   className={`transform transition ${showSuspect ? "rotate-180" : ""}`}
  //                 >
  //                   ▼
  //                 </span>
  //               </button>

  //               {showSuspect && (
  //                 <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Full Name
  //                       </label>
  //                       <input
  //                         type="text"
  //                         name="fullName"
  //                         value={suspect.fullName}
  //                         onChange={handleSuspectChange}
  //                         placeholder="Suspect full name"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Status
  //                       </label>
  //                       <select
  //                         name="status"
  //                         value={suspect.status}
  //                         onChange={handleSuspectChange}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
  //                       >
  //                         <option value="person_of_interest">
  //                           Person of Interest
  //                         </option>
  //                         <option value="suspect">Suspect</option>
  //                         <option value="accused">Accused</option>
  //                         <option value="convicted">Convicted</option>
  //                         <option value="acquitted">Acquitted</option>
  //                       </select>
  //                     </div>

  //                     <div>
  //                       <label className="bblock font-medium text-sm text-neutral-600 mb-2">
  //                         Phone
  //                       </label>
  //                       <input
  //                         type="tel"
  //                         name="phone"
  //                         value={suspect.phone}
  //                         onChange={handleSuspectChange}
  //                         placeholder="Phone number"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div>
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Email
  //                       </label>
  //                       <input
  //                         type="email"
  //                         name="email"
  //                         value={suspect.email}
  //                         onChange={handleSuspectChange}
  //                         placeholder="Email address"
  //                         className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
  //                       />
  //                     </div>

  //                     <div className="md:col-span-2">
  //                       <label className="block font-medium text-sm text-neutral-600 mb-2">
  //                         Alibi
  //                       </label>
  //                       <textarea
  //                         name="alibi"
  //                         value={suspect.alibi}
  //                         onChange={handleSuspectChange}
  //                         placeholder="Suspect's alibi..."
  //                         rows={2}
  //                         className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
  //                       />
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           {/* Form Actions */}
  //           <div className="flex gap-4 pt-6 border-t border-white/10">
  //             <button
  //               type="submit"
  //               disabled={loading}
  //               className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
  //             >
  //               {loading ? (
  //                 <>
  //                   <Loader className="w-5 h-5 animate-spin" />
  //                   Creating Case...
  //                 </>
  //               ) : (
  //                 "Create Case"
  //               )}
  //             </button>
  //             <button
  //               type="button"
  //               onClick={onCancel}
  //               className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
  //             >
  //               <X className="w-5 h-5" />
  //               Cancel
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
}
