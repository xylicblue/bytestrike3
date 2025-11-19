// src/components/TradingPanel.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-hot-toast";
import "./tradingpanel.css";
import { useMarketRealTimeData } from "./marketData";
import MintUSDC from "./components/MintUSDC";
import CollateralManager from "./components/CollateralManager";
import { useOpenPosition, useAccountValue, useMarketRiskParams } from "./hooks/useClearingHouse";
import { MARKET_IDS } from "./contracts/addresses";

// Info Tooltip Component with Portal
const InfoTooltip = ({ title, description }) => {
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const [isHovered, setIsHovered] = React.useState(false);
  const wrapperRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const tooltipLeft = rect.right - 220;
      const iconCenter = rect.left + rect.width / 2;
      const arrowLeft = iconCenter - tooltipLeft;

      setPosition({
        top: rect.bottom + 8,
        left: tooltipLeft,
        arrowLeft: arrowLeft,
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        className="info-icon-wrapper"
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="info-icon">ⓘ</span>
      </div>
      {isHovered &&
        ReactDOM.createPortal(
          <div
            className="info-tooltip info-tooltip-visible"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              "--arrow-left": `${position.arrowLeft}px`,
            }}
          >
            <div className="tooltip-title">{title}</div>
            <div className="tooltip-text">{description}</div>
          </div>,
          document.body
        )}
    </>
  );
};

const mockUserAccount = {
  availableMargin: "18,450.00 USDC",
};

export const TradingPanel = ({ selectedMarket }) => {
  const [side, setSide] = useState("Buy");
  const [size, setSize] = useState("");
  const [priceLimit, setPriceLimit] = useState("");

  // Get market ID from market name
  const marketId = MARKET_IDS[selectedMarket] || MARKET_IDS["ETH-PERP-V2"];

  // Get account value
  const { accountValue, isLoading: isLoadingAccount } = useAccountValue();

  // Get market risk parameters
  const { riskParams, isLoading: isLoadingRiskParams } = useMarketRiskParams(marketId);

  // Trading hook
  const {
    openPosition,
    isPending,
    isSuccess,
    error: tradeError,
    hash,
  } = useOpenPosition(marketId);

  // Get market name early to use in hooks
  const marketName =
    typeof selectedMarket === "string" ? selectedMarket : selectedMarket?.name;

  // Use real-time data hook instead of static getMarketDetails
  // IMPORTANT: This must be called before any conditional returns
  const { data: market, isLoading, error } = useMarketRealTimeData(marketName);

  // Handle trade success with useEffect to avoid infinite re-renders
  // IMPORTANT: useEffect must be called before conditional returns
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success(
        <div>
          <div>Position opened successfully!</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", fontSize: "0.9em" }}
          >
            View on Etherscan →
          </a>
        </div>,
        { id: "trade", duration: 5000 }
      );
      // Reset form
      setSize("");
      setPriceLimit("");
    }
  }, [isSuccess, hash]);

  // Handle trade error with useEffect to avoid infinite re-renders
  useEffect(() => {
    if (tradeError) {
      toast.error("Trade failed: " + tradeError.message, { id: "trade" });
    }
  }, [tradeError]);

  // Now we can do conditional returns
  if (!selectedMarket) {
    return (
      <div className="trading-panel-placeholder">
        <h3>Select a Market</h3>
        <p>Choose a market from the list to begin trading.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="trading-panel-placeholder">
        <h3>Loading Market Data...</h3>
        <p>Fetching live data from blockchain...</p>
        <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "8px" }}>
          Market: {marketName}
        </p>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="trading-panel-placeholder">
        <h3>Market Not Found</h3>
        <p>Could not load data for {marketName}.</p>
        <p style={{ fontSize: "0.8rem", color: "#f87171", marginTop: "8px" }}>
          Error: {error || "Unknown error"}
        </p>
      </div>
    );
  }

  const isPerpetual = market.type === "Perpetual";
  const changeIsPositive = market.change24hValue >= 0;

  // --- DYNAMIC LABELS ---
  const buyLabel = "Buy GPU Hours (Long)";
  const sellLabel = "Sell GPU Hours (Short)";

  const handleSizeButtonClick = (percentage) => {
    const simulatedTotal = 2.5;
    setSize((simulatedTotal * (percentage / 100)).toFixed(4));
  };

  // Handle trade execution
  const handleTrade = async () => {
    if (!size || parseFloat(size) <= 0) {
      toast.error("Please enter a valid size");
      return;
    }

    try {
      const isLong = side === "Buy";

      // Smart slippage protection:
      // - If user enters 0 or leaves empty: use 0 (no limit, market order)
      // - If user enters a value: validate it makes sense for the trade direction
      let priceLimitValue = 0; // Default: no slippage protection (market order)

      if (priceLimit && parseFloat(priceLimit) > 0) {
        const priceLimitNum = parseFloat(priceLimit);
        const currentPrice = parseFloat(market.price);

        // Validate slippage limit makes sense
        if (isLong) {
          // LONG: buying base, want price <= limit (pay at most X)
          // Warn if limit is way below market (would always fail)
          if (priceLimitNum < currentPrice * 0.5) {
            toast.error(
              `Price limit $${priceLimitNum.toFixed(2)} is too low. Current price is $${currentPrice.toFixed(2)}. ` +
              `For longs, set a limit above the current price.`
            );
            return;
          }
        } else {
          // SHORT: selling base, want price >= limit (sell for at least X)
          // Warn if limit is way above market (would always fail)
          if (priceLimitNum > currentPrice * 2) {
            toast.error(
              `Price limit $${priceLimitNum.toFixed(2)} is too high. Current price is $${currentPrice.toFixed(2)}. ` +
              `For shorts, set a limit below the current price or use 0 for market order.`
            );
            return;
          }
        }

        priceLimitValue = priceLimitNum;
      }

      openPosition(isLong, size, priceLimitValue);
      toast.loading(
        `${side === "Buy" ? "Opening long" : "Opening short"} position...`,
        { id: "trade" }
      );
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Failed to execute trade: " + error.message);
    }
  };

  return (
    <div className="trading-panel-container">
      {/* --- Collateral Section --- */}
      <div className="wallet-section">
        <CollateralManager />
        <MintUSDC />
      </div>

      {/* --- UNIFIED TRADING SECTION --- */}
      <div className="trading-section">
        {/* Market Header */}
        <div className="market-header">
          <span className="market-name">
            {market.displayName || market.name}
          </span>
          {market.status === "Deprecated" && (
            <span className="deprecated-badge">DEPRECATED</span>
          )}
        </div>

        {/* Market Stats Grid */}
        <div className="market-stats">
          <div className="stat-item">
            <span className="label">
              Mark Price
              <InfoTooltip
                title="Mark Price ($/hour)"
                description="The current trading price for H100 GPU compute hours from the vAMM. This is the price at which you can buy or sell GPU-hour exposure on ByteStrike."
              />
            </span>
            <span className="value price-mark">${market.price}/hr</span>
          </div>
          {isPerpetual && (
            <>
              <div className="stat-item">
                <span className="label">
                  TWAP (15m)
                  <InfoTooltip
                    title="TWAP (15 min)"
                    description="Time-Weighted Average Price of H100 GPU hours over the last 15 minutes. This smoothed price helps prevent manipulation and is used for funding rate calculations."
                  />
                </span>
                <span className="value">${market.vammPrice}/hr</span>
              </div>
              <div className="stat-item">
                <span className="label">
                  Index Price
                  <InfoTooltip
                    title="Index Price (Oracle)"
                    description="The reference price from external oracles tracking real H100 GPU rental rates. Currently fixed at $3.75/hour. Used to calculate funding rates and anchor the perpetual to spot market."
                  />
                </span>
                <span className="value">${market.indexPrice}/hr</span>
              </div>
            </>
          )}
          <div className="stat-item">
            <span className="label">
              24h Change
              <InfoTooltip
                title="24h Change"
                description="The percentage price change over the last 24 hours. Calculated by comparing current price with the price from 24 hours ago."
              />
            </span>
            <span
              className={`value ${
                changeIsPositive ? "text-green" : "text-red"
              }`}
            >
              {market.change24h}
              <span className="approx-indicator">≈</span>
            </span>
          </div>
          <div className="stat-item">
            <span className="label">
              24h Volume
              <InfoTooltip
                title="24h Volume"
                description="Total trading volume in USD over the last 24 hours. Higher volume indicates more active trading and better liquidity."
              />
            </span>
            <span className="value">
              {market.volume24h}
              <span className="approx-indicator">≈</span>
            </span>
          </div>
          {isPerpetual ? (
            <div className="stat-item">
              <span className="label">
                Funding Rate
                <InfoTooltip
                  title="Funding Rate"
                  description="The periodic payment between long and short positions every 8 hours. Positive rates mean longs (GPU buyers) pay shorts (GPU sellers); negative means shorts pay longs. This keeps the perpetual price anchored to real H100 rental market rates."
                />
              </span>
              <span className="value funding-rate">
                {market.fundingRate}
                <span className="rate-period">/8h</span>
              </span>
            </div>
          ) : (
            <div className="stat-item">
              <span className="label">Expires</span>
              <span className="value">
                {new Date(market.expiryDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* IMR (Initial Margin Requirement) */}
          <div className="stat-item">
            <span className="label">
              IMR
              <InfoTooltip
                title="Initial Margin Requirement"
                description="The minimum margin required to open a new position. For example, 10% IMR means you need $100 margin to open a $1000 position (10x leverage)."
              />
            </span>
            <span className="value">
              {isLoadingRiskParams ? (
                <span className="loading-text">...</span>
              ) : riskParams ? (
                <span className="risk-value">{riskParams.imrPercent}%</span>
              ) : (
                <span className="na-text">N/A</span>
              )}
            </span>
          </div>

          {/* MMR (Maintenance Margin Requirement) */}
          <div className="stat-item">
            <span className="label">
              MMR
              <InfoTooltip
                title="Maintenance Margin Requirement"
                description="The minimum margin needed to keep your position open. If your margin falls below this level, your position can be liquidated. Lower than IMR to give you buffer room."
              />
            </span>
            <span className="value">
              {isLoadingRiskParams ? (
                <span className="loading-text">...</span>
              ) : riskParams ? (
                <span className="risk-value">{riskParams.mmrPercent}%</span>
              ) : (
                <span className="na-text">N/A</span>
              )}
            </span>
          </div>

          {/* Liquidation Penalty (optional, can be shown) */}
          <div className="stat-item">
            <span className="label">
              Liq. Penalty
              <InfoTooltip
                title="Liquidation Penalty"
                description="The penalty charged if your position gets liquidated. This goes to the liquidator (50%) and protocol insurance fund (50%). Avoid liquidation!"
              />
            </span>
            <span className="value">
              {isLoadingRiskParams ? (
                <span className="loading-text">...</span>
              ) : riskParams ? (
                <span className="risk-value penalty">{riskParams.liquidationPenaltyPercent}%</span>
              ) : (
                <span className="na-text">N/A</span>
              )}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider"></div>

        {/* Order Entry Form */}
        <div className="order-entry">
          <div className="tp-tabs">
            <button
              className={`tp-tab-btn ${side === "Buy" ? "active-buy" : ""}`}
              onClick={() => setSide("Buy")}
            >
              <span className="btn-main-text">{"BUY"}</span>
              <span className="btn-sub-text">(LONG)</span>
            </button>
            <button
              className={`tp-tab-btn ${side === "Sell" ? "active-sell" : ""}`}
              onClick={() => setSide("Sell")}
            >
              <span className="btn-main-text">{"SELL"}</span>
              <span className="btn-sub-text">(SHORT)</span>
            </button>
          </div>

          <div className="tp-form-group">
            <label>
              Price Limit ($/hr) - Optional
              <InfoTooltip
                title="Price Limit (Slippage Protection)"
                description={
                  side === "Buy"
                    ? "For LONG positions: Maximum price per GPU-hour you're willing to pay. Leave at 0 for market order. Example: If market is $3.75/hr, set to $4.00/hr to accept up to 6.6% slippage."
                    : "For SHORT positions: Minimum price per GPU-hour you're willing to accept. Leave at 0 for market order. Example: If market is $3.75/hr, set to $3.50/hr to accept up to 6.6% slippage."
                }
              />
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="tp-input"
                placeholder={
                  side === "Buy"
                    ? "0.00 (0 = market, or max price to pay)"
                    : "0.00 (0 = market, or min price to accept)"
                }
                value={priceLimit}
                onChange={(e) => setPriceLimit(e.target.value)}
              />
            </div>
            {priceLimit && parseFloat(priceLimit) > 0 && (
              <div style={{ fontSize: "0.75rem", marginTop: "4px", color: "#888" }}>
                {side === "Buy" ? (
                  <span>
                    Max slippage:{" "}
                    {(
                      ((parseFloat(priceLimit) - parseFloat(market.price)) /
                        parseFloat(market.price)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                ) : (
                  <span>
                    Min acceptable price: $
                    {parseFloat(priceLimit).toFixed(2)} (
                    {(
                      ((parseFloat(market.price) - parseFloat(priceLimit)) /
                        parseFloat(market.price)) *
                      100
                    ).toFixed(2)}
                    % below market)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="tp-form-group">
            <label>
              Size
              <InfoTooltip
                title="Position Size"
                description="The number of H100 GPU compute hours you want to trade. Example: Size of 100 means you're opening a position on 100 GPU-hours. At $3.75/hr, this is $375 notional value."
              />
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="tp-input"
                placeholder="0.00"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
              <span className="input-asset-label">{market.baseAsset}</span>
            </div>
          </div>

          <div className="size-slider-section">
            <div className="size-slider-header">
              <span className="size-slider-label">Quick Size</span>
              <span className="size-slider-hint">% of available balance</span>
            </div>
            <div className="size-slider">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSizeButtonClick(p)}
                  title={`Use ${p}% of available balance`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="order-summary-item">
            <span>Account Value</span>
            <span>
              {isLoadingAccount
                ? "Loading..."
                : accountValue
                ? `$${parseFloat(accountValue).toFixed(2)}`
                : "$0.00"}
            </span>
          </div>

          <button
            className={`place-order-btn ${
              side === "Buy" ? "btn-buy" : "btn-sell"
            }`}
            onClick={handleTrade}
            disabled={isPending || !size || parseFloat(size) <= 0}
          >
            {isPending
              ? "Processing..."
              : side === "Buy"
              ? buyLabel
              : sellLabel}
          </button>

          {hash && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#667eea", textDecoration: "none" }}
              >
                View transaction →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
