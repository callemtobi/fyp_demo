"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import axios from "axios";
import ProtectedPage from "@/components/ProtectedPage";
import {
  connectWallet,
  getConnectedWallet,
  isMetaMaskAvailable,
  isOnCorrectNetwork,
  switchToPolygonAmoy,
  signEvidenceTransaction,
  waitForTransactionConfirmation,
  disconnectWallet,
} from "@/lib/walletService";
import { getTokenExpirationTime } from "@/lib/jwtUtils";
import {
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
} from "@/lib/toastConfig";

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const availableTags = [
  "forensic",
  "chain-of-custody",
  "verified",
  "witness-statement",
  "digital-forensics",
  "surveillance",
];

export default function UploadEvidence() {
  const [files, setFiles] = useState([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState({});
  const [fileDurations, setFileDurations] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  // Form data
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [location, setLocation] = useState("");
  const [dateCollected, setDateCollected] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [collectedBy, setCollectedBy] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState({});

  // Response data
  const [uploadedEvidences, setUploadedEvidences] = useState([]);
  const [error, setError] = useState("");

  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletSigner, setWalletSigner] = useState(null);
  const [metaMaskAvailable, setMetaMaskAvailable] = useState(false);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
    setMetaMaskAvailable(isMetaMaskAvailable());
    fetchCases();
    setInitializing(false);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!metaMaskAvailable) return;

    const handleAccountsChanged = () => {
      checkWalletConnection();
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [metaMaskAvailable]);

  // Monitor token expiration and disconnect wallet if needed
  useEffect(() => {
    const tokenExpirationCheckInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Token removed (user logged out), disconnect wallet
        if (walletConnected) {
          disconnectWallet().catch((error) => {
            console.error("Error disconnecting wallet:", error);
          });
          setWalletConnected(false);
          setWalletAddress("");
          setWalletProvider(null);
          setWalletSigner(null);
        }
      } else {
        // Check if token is about to expire or has expired
        const remainingTime = getTokenExpirationTime(token);
        if (remainingTime <= 0 && walletConnected) {
          // Token expired, disconnect wallet
          disconnectWallet().catch((error) => {
            console.error("Error disconnecting wallet:", error);
          });
          setWalletConnected(false);
          setWalletAddress("");
          setWalletProvider(null);
          setWalletSigner(null);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(tokenExpirationCheckInterval);
  }, [walletConnected]);

  useEffect(() => {
    const nextPreviewUrls = {};
    files.forEach((file) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type === "application/pdf"
      ) {
        nextPreviewUrls[fileKey] = URL.createObjectURL(file);
      }
    });

    setFilePreviewUrls(nextPreviewUrls);

    return () => {
      Object.values(nextPreviewUrls).forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [files]);

  const fetchCases = async () => {
    try {
      setLoadingCases(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/cases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setCases(response.data.data || []);
      }
    } catch (fetchError) {
      console.error("Error fetching cases:", fetchError);
      const errorMsg =
        fetchError.response?.data?.message || "Failed to load cases";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setLoadingCases(false);
    }
  };

  const checkWalletConnection = async () => {
    const result = await getConnectedWallet();
    if (result.success && result.connected) {
      setWalletConnected(true);
      setWalletAddress(result.address);
      setWalletProvider(result.provider);
      setWalletSigner(result.signer);
    } else {
      setWalletConnected(false);
      setWalletAddress("");
    }
  };

  const handleConnectWallet = async () => {
    try {
      setError("");
      const result = await connectWallet();

      if (!result.success) {
        const errorMsg = result.error || "Failed to connect wallet";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      // Check if on correct network
      const networkCheck = await isOnCorrectNetwork(result.provider);
      if (!networkCheck.success || !networkCheck.isCorrect) {
        // Try to switch to correct network
        const switchResult = await switchToPolygonAmoy();
        if (!switchResult.success) {
          const errorMsg = "Please switch to Polygon Amoy network in MetaMask";
          setError(errorMsg);
          showErrorToast(errorMsg);
          return;
        }
      }

      setWalletConnected(true);
      setWalletAddress(result.address);
      setWalletProvider(result.provider);
      setWalletSigner(result.signer);
      showSuccessToast("Wallet connected successfully!");
    } catch (err) {
      console.error("Wallet connection error:", err);
      const errorMsg = err.message || "Failed to connect wallet";
      setError(errorMsg);
      showErrorToast(errorMsg);
    }
  };

  const getVideoDuration = (file) =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration || 0);
      };
      video.onerror = () => reject(new Error("Unable to read video metadata"));
      video.src = window.URL.createObjectURL(file);
    });

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    try {
      const durations = {};
      for (const selectedFile of selectedFiles) {
        if (!ACCEPTED_MIME_TYPES.includes(selectedFile.type)) {
          throw new Error(
            `${selectedFile.name}: only images, PDFs, and videos are allowed.`,
          );
        }

        if (selectedFile.type.startsWith("video/")) {
          const videoDuration = await getVideoDuration(selectedFile);
          if (videoDuration > 10) {
            throw new Error(
              `${selectedFile.name}: video must be 10 seconds or less.`,
            );
          }
          durations[selectedFile.name] = Number(videoDuration.toFixed(2));
        }
      }

      setFiles((prevFiles) => {
        const existingKeys = new Set(
          prevFiles.map(
            (file) => `${file.name}-${file.size}-${file.lastModified}`,
          ),
        );
        const dedupedNewFiles = selectedFiles.filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          return !existingKeys.has(key);
        });
        return [...prevFiles, ...dedupedNewFiles];
      });

      setFileDurations((prevDurations) => ({
        ...prevDurations,
        ...durations,
      }));
      setShowHash(false);
      setUploadedEvidences([]);
      setError("");
    } catch (selectError) {
      const errorMsg = selectError.message || "Invalid file selection";
      setError(errorMsg);
      showErrorToast(errorMsg);
      setFiles([]);
      setFilePreviewUrls({});
      setFileDurations({});
    }

    e.target.value = "";
  };

  const removeEvidenceFile = (fileToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size &&
            file.lastModified === fileToRemove.lastModified
          ),
      ),
    );
    setFileDurations((prevDurations) => {
      const nextDurations = { ...prevDurations };
      delete nextDurations[fileToRemove.name];
      return nextDurations;
    });
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const uploadFile = async () => {
    try {
      // Validation
      if (!selectedCaseId) {
        const errorMsg = "Please select a case before uploading evidence";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      if (!files.length) {
        const errorMsg = "No files selected";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      if (!evidenceTitle.trim()) {
        const errorMsg = "Evidence title is required";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }
      if (!description.trim()) {
        const errorMsg = "Description is required";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      if (!walletConnected) {
        const errorMsg = "Please connect your wallet first";
        setError(errorMsg);
        showErrorToast(errorMsg);
        return;
      }

      setUploading(true);
      setError("");

      // Create FormData
      const formData = new FormData();
      files.forEach((selectedFile) => {
        formData.append("files", selectedFile);
      });
      formData.append("caseId", selectedCaseId);
      formData.append("evidenceTitle", evidenceTitle);
      formData.append("description", description);
      formData.append("walletAddress", walletAddress);

      // Optional fields - convert selected tags to comma-separated string
      const selectedTagsList = Object.keys(selectedTags).filter(
        (tag) => selectedTags[tag],
      );
      if (selectedTagsList.length > 0) {
        formData.append("tags", selectedTagsList.join(","));
      }

      // Add metadata as JSON string
      const metadata = {
        evidenceTitle: evidenceTitle.trim(),
        source: source.trim(),
        location: location.trim(),
        incidentDate: incidentDate || null,
        dateCollected: dateCollected || null,
        collectedBy: collectedBy.trim(),
        deviceInfo: deviceInfo.trim(),
        notes: notes.trim(),
        uploadDate: new Date().toISOString(),
      };
      formData.append("metadata", JSON.stringify(metadata));
      formData.append("fileDurations", JSON.stringify(fileDurations));

      const token = localStorage.getItem("token");

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
        const evidences = response.data.data?.evidences || [];
        if (!evidences.length) {
          throw new Error("No evidence data returned from server");
        }

        setUploadedEvidences(evidences);

        for (const evidence of evidences) {
          await signBlockchainTransaction(
            evidence._id,
            evidence.ipfsHash,
            evidence.fileHash,
          );
        }

        setShowHash(true);
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

  const signBlockchainTransaction = async (
    mongoDbId,
    ipfsHashValue,
    fileHashValue,
  ) => {
    try {
      setUploading(true);

      if (!walletSigner || !ipfsHashValue || !fileHashValue) {
        setError("Missing required data for blockchain transaction");
        setUploading(false);
        return;
      }

      if (!mongoDbId) {
        setError("Evidence ID not found");
        setUploading(false);
        return;
      }

      console.log("🔗 Starting blockchain transaction signing...");
      console.log("   Evidence ID (MongoDB):", mongoDbId);
      console.log("   IPFS Hash:", ipfsHashValue);
      console.log("   File Hash:", fileHashValue);

      // Get contract address from environment or config
      const contractAddress = "0x876b6e908ac96D3108eE49c42977ad1Cf59274A3";

      // Sign transaction
      console.log("📝 Signing transaction with wallet...");
      const txResult = await signEvidenceTransaction(
        contractAddress,
        ipfsHashValue,
        fileHashValue,
        walletSigner,
        walletProvider,
      );

      if (!txResult.success) {
        setError(txResult.error || "Failed to sign transaction");
        setUploading(false);
        return;
      }

      console.log("✅ Transaction signed:", txResult.transactionHash);

      // Wait for confirmation
      console.log("⏳ Waiting for blockchain confirmation...");
      const confirmationResult = await waitForTransactionConfirmation(
        walletProvider,
        txResult.transactionHash,
        1,
      );

      if (confirmationResult.success) {
        console.log("✅ Transaction confirmed:", {
          blockNumber: confirmationResult.blockNumber,
          gasUsed: confirmationResult.gasUsed,
        });

        // Update backend with transaction hash
        console.log("📤 Updating backend with transaction details...");
        try {
          const backendResponse = await axios.post(
            `http://localhost:8000/api/evidence/${mongoDbId}/confirm-blockchain`,
            {
              transactionHash: txResult.transactionHash,
              blockNumber: confirmationResult.blockNumber,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          if (backendResponse.data.success) {
            console.log("✅ Backend confirmation successful");
            setError("");
          } else {
            setError(
              backendResponse.data.message || "Backend confirmation failed",
            );
          }
        } catch (backendError) {
          console.error("❌ Backend error:", backendError);
          if (backendError.response?.data?.message) {
            setError(backendError.response.data.message);
          } else if (backendError.response?.status === 404) {
            setError(
              "Evidence not found. Please ensure the file was uploaded correctly.",
            );
          } else {
            setError(
              backendError.response?.data?.error ||
                "Failed to confirm transaction on backend. Check server logs.",
            );
          }
        }
      } else {
        setError(
          confirmationResult.error ||
            "Failed to confirm transaction on blockchain",
        );
      }
    } catch (error) {
      console.error("❌ Blockchain transaction error:", error);
      setError(error.message || "Failed to process blockchain transaction");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setFilePreviewUrls({});
    setFileDurations({});
    setShowHash(false);
    setSelectedCaseId("");
    setEvidenceTitle("");
    setDescription("");
    setSource("");
    setLocation("");
    setDateCollected("");
    setIncidentDate("");
    setCollectedBy("");
    setDeviceInfo("");
    setNotes("");
    setSelectedTags({});
    setUploadedEvidences([]);
    setError("");
  };

  return (
    <ProtectedPage
      requiredRoles={["Investigator", "Police Officer", "Forensic Analyst"]}
      pageName="Upload Evidence"
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-neutral-800 mb-2">Upload Evidence</h1>
          <p className="text-sm text-neutral-500">
            Upload and hash forensic evidence
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Wallet Connection Alert */}
          {!walletConnected && metaMaskAvailable && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Connect Your Wallet
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Connect MetaMask to securely sign blockchain transactions
                    for your evidence uploads.
                  </p>
                  <button
                    onClick={handleConnectWallet}
                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Connect MetaMask
                  </button>
                </div>
              </div>
            </div>
          )}

          {walletConnected && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-green-700 font-medium">
                    Wallet Connected: {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={() => setWalletConnected(false)}
                  className="text-xs text-green-600 hover:text-green-700"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {!metaMaskAvailable && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-orange-900 font-medium mb-2">
                    MetaMask Not Detected
                  </p>
                  <p className="text-xs text-orange-700 mb-3">
                    Please install MetaMask extension to sign blockchain
                    transactions.
                  </p>
                  <a
                    href="https://metamask.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Download MetaMask →
                  </a>
                </div>
              </div>
            </div>
          )}
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
            <h2 className="text-sm text-neutral-700 mb-4">Select Case</h2>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              disabled={uploading || loadingCases}
              className="w-full mb-6 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">
                {loadingCases
                  ? "Loading cases..."
                  : "Choose a case to continue"}
              </option>
              {cases.map((caseItem, index) => (
                <option
                  key={caseItem._id || caseItem.id || `case-${index}`}
                  value={caseItem._id}
                >
                  {caseItem.caseNumber} - {caseItem.title}
                </option>
              ))}
            </select>

            <h2 className="text-sm text-neutral-700 mb-4">
              Select Evidence Files
            </h2>

            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,video/mp4,video/webm,video/quicktime,.pdf"
              multiple
              disabled={!walletConnected || uploading || !selectedCaseId}
            />

            {initializing ? (
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-neutral-50 animate-pulse">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full mx-auto"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-neutral-200 rounded w-2/3 mx-auto"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-neutral-50">
                {files.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2
                        className="w-6 h-6 text-green-600"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-sm text-neutral-700 mb-1">
                      {files.length} file(s) selected
                    </p>
                    <ul className="text-xs text-neutral-500 mb-2 text-left max-h-36 overflow-y-auto">
                      {files.map((file, index) => (
                        <li key={file.name || `file-${index}`}>
                          {file.name} - {(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-3 mt-3">
                      <label
                        htmlFor="file-upload"
                        className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Add more evidence
                      </label>
                      <button
                        onClick={() => {
                          setFiles([]);
                          setFileDurations({});
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                        disabled={uploading}
                      >
                        Clear all
                      </button>
                    </div>
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
                    <label
                      htmlFor="file-upload"
                      className={`px-6 py-2 text-sm rounded-lg transition-colors cursor-pointer font-medium ${
                        walletConnected && selectedCaseId
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      Choose Files
                    </label>
                    {!selectedCaseId && (
                      <p className="text-xs text-neutral-500 mt-3">
                        Select a case first
                      </p>
                    )}
                    {!walletConnected && selectedCaseId && (
                      <p className="text-xs text-neutral-500 mt-3">
                        Connect wallet first to upload evidence
                      </p>
                    )}
                    {walletConnected && selectedCaseId && (
                      <p className="text-xs text-neutral-500 mt-3">
                        Images/PDF allowed, videos must be 10 seconds max
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-neutral-700">
                    Selected Evidences
                  </h3>
                  <label
                    htmlFor="file-upload"
                    className={`text-xs font-medium ${
                      uploading
                        ? "text-neutral-400 cursor-not-allowed"
                        : "text-blue-600 hover:text-blue-700 cursor-pointer"
                    }`}
                  >
                    + Add more evidence
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file) => {
                    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
                    const previewUrl = filePreviewUrls[fileKey];

                    return (
                      <div
                        key={fileKey}
                        className="border border-neutral-200 rounded-lg p-3 bg-neutral-50"
                      >
                        <div className="h-40 bg-white rounded border border-neutral-200 flex items-center justify-center overflow-hidden mb-3">
                          {file.type.startsWith("image/") && previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="w-full h-full object-contain"
                            />
                          ) : file.type.startsWith("video/") && previewUrl ? (
                            <video
                              src={previewUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : file.type === "application/pdf" && previewUrl ? (
                            <iframe
                              src={previewUrl}
                              title={file.name}
                              className="w-full h-full"
                            />
                          ) : (
                            <span className="text-xs text-neutral-500">
                              Preview unavailable
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-700 font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {file.type.startsWith("video/") &&
                          fileDurations[file.name] !== undefined && (
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Duration: {fileDurations[file.name]}s
                            </p>
                          )}
                        <button
                          onClick={() => removeEvidenceFile(file)}
                          className="text-[11px] text-red-600 hover:text-red-700 mt-2"
                          disabled={uploading}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {files.length === 0 && (
              <p className="text-xs text-red-500 mt-4">
                Minimum one evidence is required to initiate evidence.
              </p>
            )}
          </div>

          {/* Metadata Form */}
          {files.length > 0 && !showHash && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <h2 className="text-sm text-neutral-700 mb-4">
                Evidence Details
              </h2>

              <div className="space-y-4">
                {/* Evidence Title */}
                <div>
                  <label className="block text-xs text-neutral-600 mb-2">
                    Evidence Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    disabled={uploading}
                    placeholder="e.g. CCTV footage from front entrance"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Source (camera, witness, seized device)"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Collection location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <input
                    type="datetime-local"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <input
                    type="datetime-local"
                    value={dateCollected}
                    onChange={(e) => setDateCollected(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Collected by"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <input
                    type="text"
                    placeholder="Device / file origin details"
                    value={deviceInfo}
                    onChange={(e) => setDeviceInfo(e.target.value)}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />

                {/* Tags */}
                <div>
                  <label className="block text-xs text-neutral-600 mb-3">
                    Tags{" "}
                    <span className="text-neutral-400">(Select multiple)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 cursor-pointer p-3 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 hover:border-blue-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags[tag] || false}
                          onChange={() => handleTagToggle(tag)}
                          disabled={uploading}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-xs text-neutral-700 capitalize font-medium">
                          {tag}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hash Display */}
          {files.length > 0 && showHash && (
            <div className="space-y-4 mb-6">
              {/* Evidence ID - Prominent Display */}
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
                  </div>
                </div>
              </div>

              {uploadedEvidences.map((evidence) => (
                <div
                  key={evidence._id}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-6"
                >
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    {evidence.evidenceId}
                  </p>
                  <p className="text-xs text-blue-700 mb-1">SHA-256</p>
                  <code className="text-xs text-blue-700 font-mono break-all block bg-white p-3 rounded mb-3">
                    {evidence.fileHash}
                  </code>
                  <p className="text-xs text-blue-700 mb-1">IPFS CID</p>
                  <code className="text-xs text-blue-700 font-mono break-all block bg-white p-3 rounded mb-2">
                    {evidence.ipfsHash}
                  </code>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${evidence.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:underline"
                  >
                    → View on IPFS Gateway
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {files.length > 0 && (
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
                      !evidenceTitle.trim() ||
                      !selectedCaseId
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
                      "Generate Hashes & Upload"
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
    </ProtectedPage>
  );
}
