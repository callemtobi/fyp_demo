"use client";

import { useState } from "react";
import { Upload, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

export default function UploadEvidence() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showHash, setShowHash] = useState(false);

  // Form data
  const [caseId, setCaseId] = useState("");
  const [evidenceType, setEvidenceType] = useState("");
  const [description, setDescription] = useState("");
  const allowedTypes = ["Digital Document", "Image", "Other"];

  // Response data
  const [ipfsHash, setIpfsHash] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFile(selectedFile.name);
      setShowHash(false);
      setError("");
    }
  };

  const uploadFile = async () => {
    try {
      // Validation
      if (!file) {
        setError("No file selected");
        return;
      }

      // added
      if (!caseId.trim()) {
        setError("At least one of Case ID or Description is required");
        return;
      }

      if (!description.trim()) {
        setError("Description is required");
        return;
      }
      if (!allowedTypes.includes(evidenceType)) {
        setError(
          "Please select either 'Digital Document', 'Image', or 'Other'",
        );
        return;
      }

      setUploading(true);
      setError("");

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId); // added
      formData.append("description", description);

      // Optional fields
      // if (caseId.trim()) {
      //   formData.append("caseId", caseId);
      // }

      // Add metadata as JSON string
      const metadata = {
        evidenceType: evidenceType,
        uploadDate: new Date().toISOString(),
      };
      formData.append("metadata", JSON.stringify(metadata));

      // Get auth token from localStorage (adjust based on your auth implementation)
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token) {
        // alert("Please login first!");
        console.log("No token found");
        // return;
      }

      // Upload to backend
      const response = await axios.post(
        "http://localhost:8000/api/evidence/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Handle successful upload
      if (response.data.success) {
        const { evidence, ipfsUrl } = response.data.data;

        setIpfsHash(evidence.ipfsHash);
        setFileHash(evidence.fileHash);
        setEvidenceId(evidence.evidenceId);
        setShowHash(true);

        console.log("Upload successful:", {
          evidenceId: evidence.evidenceId,
          ipfsUrl: ipfsUrl,
          fileHash: evidence.fileHash,
        });
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (e) {
      console.error("Upload error:", e);

      // Handle different error types
      if (e.response) {
        // Server responded with error
        setError(e.response.data.message || "Server error during upload");
      } else if (e.request) {
        // Request made but no response
        setError("No response from server. Check if backend is running.");
      } else {
        // Other errors
        setError(e.message || "Error uploading file");
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setUploadedFile(null);
    setShowHash(false);
    setCaseId("");
    setDescription("");
    setEvidenceType("");
    setIpfsHash("");
    setFileHash("");
    setEvidenceId("");
    setError("");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-neutral-800 mb-2">Upload Evidence</h1>
        <p className="text-sm text-neutral-500">
          Upload and hash forensic evidence
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-red-600 mt-0.5"
                strokeWidth={1.5}
              />
              <div className="flex-1">
                <p className="text-sm text-red-900">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h2 className="text-sm text-neutral-700 mb-4">
            Select Evidence File
          </h2>

          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-neutral-50">
            {uploadedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2
                    className="w-6 h-6 text-green-600"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm text-neutral-700 mb-1">{uploadedFile}</p>
                <p className="text-xs text-neutral-500 mb-2">
                  {(file?.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadedFile(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                  disabled={uploading}
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload
                  className="w-10 h-10 text-neutral-400 mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-sm text-neutral-700 mb-4">
                  Select evidence file to upload
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
                <p className="text-xs text-neutral-500 mt-3">
                  Max file size: 100MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Form */}
        {uploadedFile && !showHash && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-sm text-neutral-700 mb-4">Evidence Details</h2>

            <div className="space-y-4">
              {/* Case ID */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Case ID <span className="text-neutral-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., CASE-001"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Evidence Type */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  <option>Digital Document</option>
                  <option>Image</option>
                  {/* <option>Video</option>
                  <option>Audio</option>
                  <option>Database Export</option>
                  <option>Log File</option> */}
                  <option>Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-neutral-600 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the evidence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hash Display */}
        {uploadedFile && showHash && (
          <div className="space-y-4 mb-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 text-green-600 mt-0.5"
                  strokeWidth={1.5}
                />
                <div className="flex-1">
                  <p className="text-sm text-green-900 font-medium mb-1">
                    Evidence Uploaded Successfully
                  </p>
                  <p className="text-xs text-green-700">
                    Evidence ID: {evidenceId}
                  </p>
                </div>
              </div>
            </div>

            {/* File Hash */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Hash
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  strokeWidth={1.5}
                />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 mb-2 font-medium">
                    SHA-256 File Hash
                  </p>
                  <code className="text-xs text-blue-700 font-mono break-all block bg-white p-3 rounded">
                    {fileHash}
                  </code>
                  <p className="text-xs text-blue-700 mt-2">
                    ✓ Use this hash to verify file integrity
                  </p>
                </div>
              </div>
            </div>

            {/* IPFS Hash */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Hash
                  className="w-5 h-5 text-purple-600 mt-0.5"
                  strokeWidth={1.5}
                />
                <div className="flex-1">
                  <p className="text-sm text-purple-900 mb-2 font-medium">
                    IPFS Hash (CID)
                  </p>
                  <code className="text-xs text-purple-700 font-mono break-all block bg-white p-3 rounded">
                    {ipfsHash}
                  </code>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-700 mt-2 inline-block hover:underline"
                  >
                    → View on IPFS Gateway
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {uploadedFile && (
          <div className="flex items-center gap-3 justify-center">
            {!showHash ? (
              <>
                <button
                  onClick={resetForm}
                  disabled={uploading}
                  className="px-8 py-3 bg-neutral-200 text-neutral-700 text-sm rounded-lg hover:bg-neutral-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadFile}
                  disabled={
                    uploading ||
                    !description.trim() ||
                    !caseId.trim() ||
                    !evidenceType
                  }
                  className="px-8 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Generate Hash & Upload"
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload Complete - Add Another
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------- by me

// "use client";

// import { useState } from "react";
// import { Upload, Hash, CheckCircle2 } from "lucide-react";
// import axios from "axios";

// export default function UploadEvidence() {
//   const [file, setFile] = useState(null);
//   const [url, setUrl] = useState("");
//   const [uploading, setUploading] = useState(false);
//   // -----------
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [showHash, setShowHash] = useState(false);

//   const uploadFile = async () => {
//     try {
//       if (!file) {
//         alert("No file selected");
//         return;
//       }

//       setUploading(true);
//       const data = new FormData();
//       data.set("file", file);
//       const uploadRequest = await axios.post(
//         "http://localhost:5000/api/evidence/upload",
//         data,
//       );
//       // const uploadRequest = await fetch("/api/files", {
//       //   method: "POST",
//       //   body: data,
//       // });
//       const signedUrl = await uploadRequest.json();
//       setUrl(signedUrl);
//       setUploading(false);
//     } catch (e) {
//       console.log(e);
//       setUploading(false);
//       alert("Trouble uploading file");
//     }
//   };

//   const handleFileSelect = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setUploadedFile(file.name);
//       setShowHash(false);
//     }
//   };

//   const handleGenerateHash = () => {
//     setShowHash(true);
//   };

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl text-neutral-800 mb-2">Upload Evidence</h1>
//         <p className="text-sm text-neutral-500">
//           Upload and hash forensic evidence
//         </p>
//       </div>

//       <div className="max-w-3xl mx-auto">
//         {/* Upload Area */}
//         <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
//           <h2 className="text-sm text-neutral-700 mb-4">
//             Select Evidence File
//           </h2>

//           <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-neutral-50">
//             {uploadedFile ? (
//               <div className="flex flex-col items-center">
//                 <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
//                   <CheckCircle2
//                     className="w-6 h-6 text-green-600"
//                     strokeWidth={1.5}
//                   />
//                 </div>
//                 <p className="text-sm text-neutral-700 mb-1">{uploadedFile}</p>
//                 <button
//                   onClick={() => setUploadedFile(null)}
//                   className="text-xs text-blue-600 hover:text-blue-700 mt-2"
//                 >
//                   Change file
//                 </button>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center">
//                 <Upload
//                   className="w-10 h-10 text-neutral-400 mb-4"
//                   strokeWidth={1.5}
//                 />
//                 <p className="text-sm text-neutral-700 mb-4">
//                   Select evidence file to upload
//                 </p>
//                 <input
//                   type="file"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                   id="file-upload"
//                 />
//                 <label
//                   htmlFor="file-upload"
//                   className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
//                 >
//                   Choose File
//                 </label>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Metadata Form */}
//         {uploadedFile && (
//           <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
//             <h2 className="text-sm text-neutral-700 mb-4">Evidence Details</h2>

//             <div className="space-y-4">
//               {/* Case ID */}
//               <div>
//                 <label className="block text-xs text-neutral-600 mb-2">
//                   Case ID
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g., CASE-001"
//                   className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               {/* Evidence Type */}
//               <div>
//                 <label className="block text-xs text-neutral-600 mb-2">
//                   Evidence Type
//                 </label>
//                 <select className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                   <option>Digital Document</option>
//                   <option>Image</option>
//                 </select>
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-xs text-neutral-600 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder="Brief description of the evidence..."
//                   className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Hash Display */}
//         {uploadedFile && showHash && (
//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
//             <div className="flex items-start gap-3">
//               <Hash
//                 className="w-5 h-5 text-blue-600 mt-0.5"
//                 strokeWidth={1.5}
//               />
//               <div className="flex-1">
//                 <p className="text-sm text-blue-900 mb-2">
//                   SHA-256 Hash Generated
//                 </p>
//                 <code className="text-xs text-blue-700 font-mono break-all block bg-white p-3 rounded">
//                   a3c5f8e2b1d4e7f9c8b2a5d6e3f1b8c4e7a9b2d5f8c1e4b7a3f6d9c2e5b8a1
//                 </code>
//                 <p className="text-xs text-blue-700 mt-2">
//                   ✓ Hash stored on blockchain
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Actions */}
//         {uploadedFile && (
//           <div className="flex items-center gap-3 justify-center">
//             {!showHash ? (
//               <button
//                 onClick={uploadFile}
//                 disabled={uploading}
//                 className="px-8 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 {uploading ? "Uploading..." : "Generate Hash & Upload"}
//               </button>
//             ) : (
//               <button
//                 onClick={() => {
//                   setUploadedFile(null);
//                   setShowHash(false);
//                 }}
//                 className="px-8 py-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Upload Complete - Add Another
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
