import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create client
const client = createThirdwebClient({
  clientId: "YOUR_CLIENT_ID", // Get from thirdweb dashboard
});

// Connect to contract (read-only)
export const contract = getContract({
  client,
  chain: defineChain(80002),
  address: "0x876b6e908ac96D3108eE49c42977ad1Cf59274A3",
});
