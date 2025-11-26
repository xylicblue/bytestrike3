// Component for managing collateral deposits and withdrawals
import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseUnits, formatUnits } from "ethers";
import { toast } from "react-hot-toast";
import { SEPOLIA_CONTRACTS, COLLATERAL_TOKENS } from "../contracts/addresses";
import { useDeposit, useWithdraw } from "../hooks/useClearingHouse";
import "./CollateralManager.css";

const FAUCET_API_URL =
  "https://bytestrike-faucet-bot-production-1fc7.up.railway.app";

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export function CollateralManager() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState(COLLATERAL_TOKENS[0]); // Default to mUSDC
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(true);

  // Faucet state
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetTxHash, setFaucetTxHash] = useState("");

  // Get ETH balance for faucet eligibility check
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  // Approval state
  const {
    writeContract: approveToken,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract();
  const { isLoading: isApprovingTx, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Deposit/Withdraw hooks
  const {
    deposit,
    isPending: isDepositPending,
    isSuccess: isDepositSuccess,
    hash: depositHash,
  } = useDeposit();
  const {
    withdraw,
    isPending: isWithdrawPending,
    isSuccess: isWithdrawSuccess,
    hash: withdrawHash,
  } = useWithdraw();

  // Check token balance
  const { data: tokenBalance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // Check allowance - MUST approve CollateralVault, not ClearingHouse
  // The vault is what actually calls transferFrom
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, SEPOLIA_CONTRACTS.collateralVault],
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  // Format balances
  const formattedBalance = tokenBalance
    ? formatUnits(tokenBalance, selectedToken.decimals)
    : "0";

  const formattedAllowance = allowance
    ? formatUnits(allowance, selectedToken.decimals)
    : "0";

  // Handle approve
  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountWei = parseUnits(amount, selectedToken.decimals);

      // IMPORTANT: Approve the CollateralVault, not ClearingHouse
      // The vault is what actually calls transferFrom during deposit
      approveToken({
        address: selectedToken.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [SEPOLIA_CONTRACTS.collateralVault, amountWei],
        chainId: 11155111,
      });

      toast.loading("Approving tokens...", { id: "approve" });
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve: " + error.message);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if needs approval
    const amountNum = parseFloat(amount);
    const allowanceNum = parseFloat(formattedAllowance);

    if (allowanceNum < amountNum) {
      toast.error(
        `Insufficient allowance. Please approve ${amount} ${selectedToken.symbol} first.`
      );
      return;
    }

    try {
      deposit(selectedToken.address, amount);
      toast.loading("Depositing collateral...", { id: "deposit" });
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to deposit: " + error.message);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      withdraw(selectedToken.address, amount);
      toast.loading("Withdrawing collateral...", { id: "withdraw" });
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Failed to withdraw: " + error.message);
    }
  };

  // Handle faucet request for test ETH
  const handleFaucetRequest = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsFaucetLoading(true);
    setFaucetTxHash("");

    try {
      const response = await fetch(`${FAUCET_API_URL}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`🎉 Success! Sent ${data.amount} ETH to your wallet`, {
          id: "faucet",
        });
        setFaucetTxHash(data.txHash);
        // Refetch ETH balance after successful faucet
        setTimeout(() => refetchEthBalance(), 3000);
      } else {
        toast.error(data.error || "Failed to get test ETH", { id: "faucet" });
      }
    } catch (error) {
      console.error("Faucet error:", error);
      toast.error("Network error. Please try again.", { id: "faucet" });
    } finally {
      setIsFaucetLoading(false);
    }
  };

  // Handle transaction success with useEffect to avoid infinite re-renders
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Tokens approved successfully!", { id: "approve" });
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isDepositSuccess) {
      toast.success("Collateral deposited successfully!", { id: "deposit" });
      setAmount("");
    }
  }, [isDepositSuccess]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      toast.success("Collateral withdrawn successfully!", { id: "withdraw" });
      setAmount("");
    }
  }, [isWithdrawSuccess]);

  if (!isConnected) {
    return (
      <div className="collateral-manager">
        <p className="not-connected">Please connect your wallet</p>
      </div>
    );
  }

  const needsApproval =
    parseFloat(amount) > 0 &&
    parseFloat(formattedAllowance) < parseFloat(amount);

  return (
    <div className="collateral-manager">
      <div className="collateral-header">
        <h3>Collateral Manager</h3>
        <div className="mode-toggle">
          <button
            className={isDepositing ? "active" : ""}
            onClick={() => setIsDepositing(true)}
          >
            Deposit
          </button>
          <button
            className={!isDepositing ? "active" : ""}
            onClick={() => setIsDepositing(false)}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Faucet Section - Get Test ETH */}
      <div className="faucet-section">
        <div className="faucet-header">
          <div className="label-with-info">
            <span className="faucet-label">Need Test ETH?</span>
            <div className="info-icon-wrapper">
              <span className="info-icon">ⓘ</span>
              <div className="info-tooltip">
                <div className="tooltip-title">Get Free Test ETH</div>
                <div className="tooltip-text">
                  New to ByteStrike? Get free Sepolia ETH to pay for gas fees.
                  You can request 0.04 ETH once every 24 hours if your balance
                  is below 0.05 ETH.
                </div>
              </div>
            </div>
          </div>
          {ethBalance && (
            <span className="eth-balance">
              {parseFloat(ethBalance.formatted).toFixed(4)} ETH
            </span>
          )}
        </div>
        <button
          className="faucet-button"
          onClick={handleFaucetRequest}
          disabled={isFaucetLoading}
        >
          {isFaucetLoading ? (
            <>
              <span className="spinner"></span>
              Requesting...
            </>
          ) : (
            <>
              {/* <span className="faucet-icon">⛽</span> */}
              Get Test ETH
            </>
          )}
        </button>
        {faucetTxHash && (
          <div className="tx-link faucet-tx">
            <a
              href={`https://sepolia.etherscan.io/tx/${faucetTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View faucet tx on Etherscan →
            </a>
          </div>
        )}
      </div>

      <div className="token-selector">
        <div className="label-with-info">
          <label>Token:</label>
          <div className="info-icon-wrapper">
            <span className="info-icon">ⓘ</span>
            <div className="info-tooltip">
              <div className="tooltip-title">What is Collateral?</div>
              <div className="tooltip-text">
                Collateral is the funds you deposit to secure your trading
                positions. It acts as margin for opening leveraged trades and
                protects against potential losses. You must maintain sufficient
                collateral to avoid liquidation.
              </div>
            </div>
          </div>
        </div>
        <select
          value={selectedToken.address}
          onChange={(e) => {
            const token = COLLATERAL_TOKENS.find(
              (t) => t.address === e.target.value
            );
            setSelectedToken(token);
          }}
        >
          {COLLATERAL_TOKENS.map((token) => (
            <option key={token.address} value={token.address}>
              {token.icon} {token.symbol} - {token.name}
            </option>
          ))}
        </select>
      </div>

      <div className="balance-info">
        <div className="balance-row">
          <span>Wallet Balance:</span>
          <span className="value">
            {parseFloat(formattedBalance).toFixed(
              selectedToken.decimals === 6 ? 2 : 4
            )}{" "}
            {selectedToken.symbol}
          </span>
        </div>
        <div className="balance-row">
          <span>Approved:</span>
          <span className="value">
            {parseFloat(formattedAllowance).toFixed(
              selectedToken.decimals === 6 ? 2 : 4
            )}{" "}
            {selectedToken.symbol}
          </span>
        </div>
      </div>

      <div className="amount-input">
        <div className="amount-header">
          <label>Amount:</label>
          <button
            className="max-button"
            onClick={() => setAmount(formattedBalance)}
          >
            MAX
          </button>
        </div>
        <div className="input-wrapper">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step={selectedToken.decimals === 6 ? "0.01" : "0.0001"}
          />
          <span className="token-symbol">{selectedToken.symbol}</span>
        </div>
      </div>

      <div className="action-buttons">
        {isDepositing ? (
          <>
            {needsApproval && (
              <div className="button-with-tooltip">
                <button
                  className="approve-button"
                  onClick={handleApprove}
                  disabled={isApproving || isApprovingTx}
                >
                  {isApproving || isApprovingTx
                    ? "Approving..."
                    : `Approve ${selectedToken.symbol}`}
                </button>
                <div className="button-tooltip">
                  <div className="tooltip-title">Why Approve?</div>
                  <div className="tooltip-text">
                    Approval grants the smart contract permission to move your
                    tokens. This is a one-time transaction required before
                    depositing. You only need to approve once per token unless
                    you want to increase the allowance.
                  </div>
                </div>
              </div>
            )}
            <button
              className="deposit-button"
              onClick={handleDeposit}
              disabled={needsApproval || isDepositPending || !amount}
              title={
                needsApproval
                  ? "Please approve tokens first"
                  : "Deposit collateral to start trading"
              }
            >
              {isDepositPending ? "Depositing..." : "Deposit Collateral"}
            </button>
          </>
        ) : (
          <button
            className="withdraw-button"
            onClick={handleWithdraw}
            disabled={isWithdrawPending || !amount}
            title="Withdraw your collateral back to your wallet"
          >
            {isWithdrawPending ? "Withdrawing..." : "Withdraw Collateral"}
          </button>
        )}
      </div>

      {/* Transaction links */}
      {approveHash && (
        <div className="tx-link">
          <a
            href={`https://sepolia.etherscan.io/tx/${approveHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View approval tx on Etherscan →
          </a>
        </div>
      )}
      {(depositHash || withdrawHash) && (
        <div className="tx-link">
          <a
            href={`https://sepolia.etherscan.io/tx/${
              depositHash || withdrawHash
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction on Etherscan →
          </a>
        </div>
      )}
    </div>
  );
}

export default CollateralManager;
