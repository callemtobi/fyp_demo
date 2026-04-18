"use client";

import { useState, useEffect } from "react";
import { Upload, Hash, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import axios from "axios";
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
import { SkeletonBlock, SkeletonCard } from "@/components/SkeletonLoader";

export default function UploadEvidence() {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Form data
  const [evidenceType, setEvidenceType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState({});
  const allowedTypes = ["Digital Document", "Image", "Other"];
  const availableTags = [
    "forensic",
    "chain-of-custody",
    "verified",
    "witness-statement",
    "digital-forensics",
    "surveillance",
  ];

  // Response data
  const [ipfsHash, setIpfsHash] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
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
        setError(result.error || "Failed to connect wallet");
        return;
      }

      // Check if on correct network
      const networkCheck = await isOnCorrectNetwork(result.provider);
      if (!networkCheck.success || !networkCheck.isCorrect) {
        // Try to switch to correct network
        const switchResult = await switchToPolygonAmoy();
        if (!switchResult.success) {
          setError("Please switch to Polygon Amoy network in MetaMask");
          return;
        }
      }

      setWalletConnected(true);
      setWalletAddress(result.address);
      setWalletProvider(result.provider);
      setWalletSigner(result.signer);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFile(selectedFile.name);
      setShowHash(false);
      setError("");
    }
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
      if (!file) {
        setError("No file selected");
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

      if (!walletConnected) {
        setError("Please connect your wallet first");
        return;
      }

      setUploading(true);
      setError("");

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      formData.append("walletAddress", walletAddress); // Add wallet address

      // Optional fields - convert selected tags to comma-separated string
      const selectedTagsList = Object.keys(selectedTags).filter(
        (tag) => selectedTags[tag],
      );
      if (selectedTagsList.length > 0) {
        formData.append("tags", selectedTagsList.join(","));
      }

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
        setEvidenceId(evidence._id); // Use MongoDB _id, not custom evidenceId

        console.log("Upload successful:", {
          evidenceId: evidence.evidenceId,
          mongoDbId: evidence._id,
          ipfsUrl: ipfsUrl,
          fileHash: evidence.fileHash,
        });

        // Sign blockchain transaction immediately
        await signBlockchainTransaction(
          evidence._id,
          evidence.ipfsHash,
          evidence.fileHash,
        );
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
            setShowHash(true);
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
    setFile(null);
    setUploadedFile(null);
    setShowHash(false);
    setDescription("");
    setEvidenceType("");
    setSelectedTags({});
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
                  Connect MetaMask to securely sign blockchain transactions for
                  your evidence uploads.
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
          <h2 className="text-sm text-neutral-700 mb-4">
            Select Evidence File
          </h2>

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
              {uploadedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2
                      className="w-6 h-6 text-green-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-sm text-neutral-700 mb-1">
                    {uploadedFile}
                  </p>
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
                    disabled={!walletConnected || uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`px-6 py-2 text-sm rounded-lg transition-colors cursor-pointer font-medium ${
                      walletConnected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    Choose File
                  </label>
                  {!walletConnected && (
                    <p className="text-xs text-neutral-500 mt-3">
                      Connect wallet first to upload evidence
                    </p>
                  )}
                  {walletConnected && (
                    <p className="text-xs text-neutral-500 mt-3">
                      Max file size: 100MB
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata Form */}
        {uploadedFile && !showHash && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h2 className="text-sm text-neutral-700 mb-4">Evidence Details</h2>

            <div className="space-y-4">
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
        {uploadedFile && showHash && (
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

            <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-orange-700">ID</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold mb-2 uppercase tracking-wide">
                    Evidence Identification
                  </p>
                  <code className="text-lg text-orange-900 font-bold font-mono break-all block bg-white p-4 rounded-lg border border-orange-200 mb-2">
                    {evidenceId}
                  </code>
                  <p className="text-xs text-orange-700">
                    ⚠️ Save this ID for reference and tracking
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
                  disabled={uploading || !description.trim() || !evidenceType}
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
