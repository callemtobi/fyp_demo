"use client";

import { AlertCircle, CheckCircle2, Loader, ExternalLink } from "lucide-react";

export default function TransactionConfirmationModal({
  isOpen,
  fileName,
  fileSize,
  description,
  walletAddress,
  isLoading,
  transactionHash,
  error,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white border-b border-blue-800">
          <h2 className="text-lg font-semibold">
            Confirm Blockchain Transaction
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            Evidence will be registered on Polygon Amoy blockchain
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Details */}
          {!transactionHash && !isLoading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-2">
                  File Information
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-neutral-500">File Name</p>
                    <p className="text-sm font-medium text-neutral-800 break-all">
                      {fileName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">File Size</p>
                    <p className="text-sm font-medium text-neutral-800">
                      {(fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Description</p>
                    <p className="text-sm text-neutral-800">{description}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-purple-600 font-semibold uppercase mb-2">
                  Connected Wallet
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <code className="text-xs font-mono text-purple-900 break-all">
                    {walletAddress}
                  </code>
                </div>
              </div>

              {/* What Happens */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <p className="text-xs text-neutral-600 font-semibold uppercase mb-3">
                  What Will Happen
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-xs text-neutral-700">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>
                      File will be uploaded to IPFS for decentralized storage
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-neutral-700">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>
                      SHA-256 hash will be calculated for file integrity
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-neutral-700">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>
                      MetaMask will prompt you to sign the blockchain
                      transaction
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-neutral-700">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>
                      Evidence will be permanently registered on Polygon Amoy
                    </span>
                  </li>
                  <li className="flex gap-2 text-xs text-neutral-700">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>
                      Transaction can be verified on Polygonscan block explorer
                    </span>
                  </li>
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">
                    Important Notice
                  </p>
                  <p className="text-xs text-orange-800">
                    Once registered on the blockchain, this evidence cannot be
                    modified or deleted. Ensure all details are correct before
                    confirming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !transactionHash && (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <Loader className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <p className="text-neutral-700 font-medium mb-2">
                Processing Transaction
              </p>
              <p className="text-sm text-neutral-500">
                Please confirm the transaction in your MetaMask wallet...
              </p>
            </div>
          )}

          {/* Transaction Success */}
          {transactionHash && !error && (
            <div className="py-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-neutral-800 mb-2">
                Transaction Submitted Successfully
              </p>
              <p className="text-sm text-neutral-600 mb-6">
                Your evidence has been registered on the blockchain
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-green-600 font-semibold uppercase mb-2">
                  Transaction Hash
                </p>
                <code className="text-xs font-mono text-green-900 break-all block mb-3">
                  {transactionHash}
                </code>
                <a
                  href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-1"
                >
                  View on Polygonscan <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="mt-0.5">ℹ️</span>
                  <span>
                    Transaction is being confirmed on the blockchain. You can
                    safely close this window.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-1">Error</p>
                <p className="text-xs text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex gap-3 justify-end">
          {!isLoading && !transactionHash && !error && (
            <>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Confirm & Sign
              </button>
            </>
          )}

          {isLoading && !transactionHash && (
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-400 rounded-lg opacity-50"
            >
              Processing...
            </button>
          )}

          {transactionHash && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Complete
            </button>
          )}

          {error && !transactionHash && (
            <>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
