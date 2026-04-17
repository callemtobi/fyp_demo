import { ethers } from "ethers";

/**
 * Check if user has MetaMask installed
 */
export const isMetaMaskAvailable = () => {
  return typeof window !== "undefined" && window.ethereum !== undefined;
};

/**
 * Connect to user's wallet (MetaMask)
 */
export const connectWallet = async () => {
  try {
    if (!isMetaMaskAvailable()) {
      throw new Error(
        "MetaMask not installed. Please install MetaMask extension.",
      );
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return {
      success: true,
      provider,
      signer,
      address,
      chainId: (await provider.getNetwork()).chainId,
    };
  } catch (error) {
    console.error("Wallet connection error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get currently connected wallet
 */
export const getConnectedWallet = async () => {
  try {
    if (!isMetaMaskAvailable()) {
      return {
        success: false,
        connected: false,
      };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      return {
        success: true,
        connected: false,
      };
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return {
      success: true,
      connected: true,
      address,
      provider,
      signer,
      chainId: (await provider.getNetwork()).chainId,
    };
  } catch (error) {
    console.error("Error getting connected wallet:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Sign transaction for evidence registration
 */
export const signEvidenceTransaction = async (
  contractAddress,
  ipfsHash,
  fileHash,
  signer,
  provider,
) => {
  try {
    console.log("📝 Preparing transaction with gas estimation...");

    // Load contract ABI
    const contractABI = [
      "function registerEvidence(string memory _ipfsHash, string memory _fileHash) public",
      "event EvidenceRegistered(indexed string ipfsHash, string fileHash, indexed address uploader, uint256 timestamp)",
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Estimate gas for the transaction
    console.log("⛽ Estimating gas...");
    const gasEstimate = await contract.registerEvidence.estimateGas(
      ipfsHash,
      fileHash,
    );

    console.log("   Estimated gas:", gasEstimate.toString());

    // Get current gas prices from network
    console.log("💰 Fetching network gas prices...");
    const feeData = await provider.getFeeData();

    console.log("   Base fee per gas:", feeData.gasPrice?.toString());
    console.log("   Max fee per gas:", feeData.maxFeePerGas?.toString());
    console.log(
      "   Max priority fee per gas:",
      feeData.maxPriorityFeePerGas?.toString(),
    );

    // Set higher gas parameters for Polygon Amoy to ensure transaction goes through
    // Polygon Amoy requires higher gas prices than defaults
    let maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || ethers.parseUnits("30", "gwei");
    let maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("100", "gwei");

    // Ensure minimum requirements for Polygon Amoy
    const minMaxPriorityFee = ethers.parseUnits("25", "gwei");
    const minMaxFee = ethers.parseUnits("50", "gwei");

    if (maxPriorityFeePerGas < minMaxPriorityFee) {
      maxPriorityFeePerGas = minMaxPriorityFee;
      console.log(
        "⚠️  Adjusted maxPriorityFeePerGas to minimum:",
        maxPriorityFeePerGas.toString(),
      );
    }

    if (maxFeePerGas < minMaxFee) {
      maxFeePerGas = minMaxFee;
      console.log(
        "⚠️  Adjusted maxFeePerGas to minimum:",
        maxFeePerGas.toString(),
      );
    }

    // Ensure maxFeePerGas is at least as high as maxPriorityFeePerGas
    if (maxFeePerGas < maxPriorityFeePerGas) {
      maxFeePerGas = maxPriorityFeePerGas;
    }

    console.log("✅ Final gas parameters:");
    console.log(
      "   Max priority fee per gas:",
      ethers.formatUnits(maxPriorityFeePerGas, "gwei"),
      "GWEI",
    );
    console.log(
      "   Max fee per gas:",
      ethers.formatUnits(maxFeePerGas, "gwei"),
      "GWEI",
    );
    console.log("   Gas limit:", gasEstimate.toString());

    // Create transaction with proper gas parameters
    const tx = await contract.registerEvidence(ipfsHash, fileHash, {
      gasLimit: (gasEstimate * BigInt(120)) / BigInt(100), // Add 20% buffer to estimated gas
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas,
    });

    console.log("✅ Transaction signed and sent:", tx.hash);

    return {
      success: true,
      transactionHash: tx.hash,
      transaction: tx,
    };
  } catch (error) {
    console.error("❌ Transaction signing error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransactionConfirmation = async (
  provider,
  transactionHash,
  confirmations = 1,
) => {
  try {
    const receipt = await provider.waitForTransaction(
      transactionHash,
      confirmations,
    );

    return {
      success: true,
      receipt,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? "success" : "failed",
    };
  } catch (error) {
    console.error("Transaction confirmation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (provider, transactionHash) => {
  try {
    const tx = await provider.getTransaction(transactionHash);
    const receipt = await provider.getTransactionReceipt(transactionHash);

    return {
      success: true,
      transaction: tx,
      receipt: receipt,
    };
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if user is on correct network (Polygon Amoy)
 */
export const isOnCorrectNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork();
    // Polygon Amoy testnet has chainId 80002
    return {
      success: true,
      isCorrect: network.chainId === 80002,
      currentChainId: network.chainId,
      currentChainName: network.name,
    };
  } catch (error) {
    console.error("Error checking network:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Switch to Polygon Amoy network
 */
export const switchToPolygonAmoy = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }], // 80002 in hex
    });

    return {
      success: true,
    };
  } catch (error) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13882",
              chainName: "Polygon Amoy",
              rpcUrls: ["https://rpc-amoy.polygon.technology/"],
              nativeCurrency: {
                name: "Polygon",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://amoy.polygonscan.com/"],
            },
          ],
        });

        return {
          success: true,
          message: "Network added and switched",
        };
      } catch (addError) {
        return {
          success: false,
          error: addError.message,
        };
      }
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's wallet balance
 */
export const getWalletBalance = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    const balanceInMatic = ethers.formatEther(balance);

    return {
      success: true,
      balance: balanceInMatic,
      balanceWei: balance.toString(),
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
