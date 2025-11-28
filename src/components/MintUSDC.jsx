// Component for minting testnet USDC tokens
import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "ethers";
import toast from "react-hot-toast";
import { SEPOLIA_CONTRACTS } from "../contracts/addresses";

// Minimal ERC20 ABI for minting
const USDC_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export function MintUSDC() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction feedback
  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading("Minting USDC...", { id: "mint" });
    }
    if (isSuccess) {
      toast.success("✅ Successfully minted 10,000 USDC!", { id: "mint" });
    }
  }, [hash, isConfirming, isSuccess]);

  // Handle errors separately
  useEffect(() => {
    if (error) {
      const errorMsg = error.message?.includes("User rejected")
        ? "Transaction cancelled"
        : `Mint failed: ${error.message}`;
      toast.error(errorMsg, { id: "mint" });
    }
  }, [error]);

  const mintUSDC = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!address) {
      toast.error("Wallet address not found");
      return;
    }

    try {
      // Mint 10,000 USDC (6 decimals for USDC)
      writeContract({
        address: SEPOLIA_CONTRACTS.usdc,
        abi: USDC_ABI,
        functionName: "mint",
        args: [address, parseUnits("10000", 6)],
      });
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <button
      onClick={mintUSDC}
      disabled={!isConnected || isPending || isConfirming}
      className="mint-usdc-button"
      title="Get free testnet USDC for trading"
    >
      {isPending || isConfirming ? "Minting..." : "Mint 10,000 USDC"}
    </button>
  );
}

export default MintUSDC;
