// src/components/Markets.js --- REDESIGNED VERSION ---

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useMarketsData } from "./marketData";
import { useMarket } from "./marketcontext";

const formatPrice = (price) =>
  price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatPercent = (percent) =>
  `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;

export const Markets = () => {
  const { markets, isLoading, error } = useMarketsData();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { selectMarket, selectedMarket } = useMarket();
  const previousPricesRef = useRef({});
  const [priceChanges, setPriceChanges] = useState({});

  // Track price changes for animations
  useEffect(() => {
    const changes = {};
    markets.forEach((market) => {
      const currentPrice = market.markPrice || market.oraclePrice;
      const previousPrice = previousPricesRef.current[market.name];

      if (previousPrice !== undefined && previousPrice !== currentPrice) {
        changes[market.name] = currentPrice > previousPrice ? "up" : "down";

        setTimeout(() => {
          setPriceChanges((prev) => {
            const updated = { ...prev };
            delete updated[market.name];
            return updated;
          });
        }, 1000);
      }

      previousPricesRef.current[market.name] = currentPrice;
    });

    if (Object.keys(changes).length > 0) {
      setPriceChanges((prev) => ({ ...prev, ...changes }));
    }
  }, [markets]);

  const filteredAndSearchedMarkets = useMemo(() => {
    return markets
      .filter((market) => {
        if (filter === "All") return true;
        return market.type === filter;
      })
      .filter((market) =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [markets, filter, searchTerm]);

  if (isLoading)
    return (
      <div className="markets-loading">
        <div className="markets-loading-spinner"></div>
        <span>Loading markets...</span>
      </div>
    );

  if (error)
    return (
      <div className="markets-error">
        <span className="markets-error-icon">⚠</span>
        <span>Failed to load markets</span>
      </div>
    );

  return (
    <div className="markets-container">
      {/* Header */}
      <div className="markets-header">
        <h2>Markets</h2>
        <span className="markets-count">
          {filteredAndSearchedMarkets.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="markets-search-wrapper">
        <svg
          className="markets-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search markets..."
          className="markets-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="markets-tabs">
        {["All", "Perpetual", "Future"].map((type) => (
          <button
            key={type}
            className={`markets-tab ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
          >
            {type === "Perpetual"
              ? "Perps"
              : type === "Future"
              ? "Futures"
              : type}
          </button>
        ))}
      </div>

      {/* Markets List */}
      <div className="markets-list">
        {filteredAndSearchedMarkets.map((market) => {
          const isSelected = selectedMarket?.name === market.name;
          const priceChange = priceChanges[market.name];
          const isPositive = market.change24h > 0;

          return (
            <div
              key={market.name}
              className={`market-item ${isSelected ? "selected" : ""}`}
              onClick={() => selectMarket(market.name)}
            >
              {/* Market Name as Main Heading */}
              <div className="market-heading">
                <span className="market-name">
                  {market.displayName || market.name}
                </span>
                {market.status === "Deprecated" && (
                  <span className="market-badge-old">OLD</span>
                )}
                <span className="market-type-badge">{market.type}</span>
              </div>

              {/* Data Card */}
              <div
                className={`market-card ${
                  priceChange ? `flash-${priceChange}` : ""
                }`}
              >
                <div className="market-stat">
                  <span className="market-stat-label">Price</span>
                  <span
                    className={`market-stat-value ${
                      priceChange ? `price-${priceChange}` : ""
                    }`}
                  >
                    ${formatPrice(market.markPrice || market.oraclePrice)}
                  </span>
                </div>
                <div className="market-stat">
                  <span className="market-stat-label">24h Change</span>
                  <span
                    className={`market-stat-value ${
                      isPositive ? "positive" : "negative"
                    }`}
                  >
                    {formatPercent(market.change24h)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
