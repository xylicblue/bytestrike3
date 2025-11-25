// src/TradingPage.js

import React, { useState, useEffect } from "react";
import { TradingDashboard } from "./tradingdash";
import { MarketProvider } from "./marketcontext";
import NetworkGuard from "./components/NetworkGuard";
import WelcomeModal from "./components/WelcomeModal";

const TradingPage = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("bytestrike_visited");

    if (!hasVisited) {
      // Show welcome modal for first-time visitors
      setShowWelcome(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    // Mark as visited
    localStorage.setItem("bytestrike_visited", "true");
  };

  return (
    <main className="trading-page-main">
      {/* Testnet Banner */}
      <div className="testnet-banner">
        <div className="testnet-banner-content">
          <span className="testnet-icon">🧪</span>
          <span className="testnet-text">
            <strong>Testnet Mode</strong> — You're trading with test tokens. No
            real money is involved.
          </span>
        </div>
      </div>

      <NetworkGuard>
        <MarketProvider>
          <TradingDashboard />
        </MarketProvider>
      </NetworkGuard>

      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />

      {/* Test button to reopen guide */}
      <button
        onClick={() => setShowWelcome(true)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          padding: "0.75rem 1.5rem",
          background: "rgba(20, 20, 20, 0.95)",
          border: "1px solid rgba(88, 166, 255, 0.3)",
          borderRadius: "50px",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 6px 20px rgba(88, 166, 255, 0.4)";
          e.target.style.background = "rgba(30, 30, 30, 0.95)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.4)";
          e.target.style.background = "rgba(20, 20, 20, 0.95)";
        }}
      >
        Quick Guide
      </button>
    </main>
  );
};

export default TradingPage;
