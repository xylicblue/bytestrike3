import React, { useState, useEffect } from "react";
import { supabase } from "./creatclient";
import { useAccount } from "wagmi";
import { useAllPositions, useAccountValue } from "./hooks/useClearingHouse";
import { useMarkPrice } from "./hooks/useVAMM";
import "./portfolio.css";

import {
  HiOutlineWallet,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineBanknotes,
  HiOutlineRectangleStack,
  HiOutlineArrowsRightLeft,
  HiArrowUp,
  HiArrowDown,
} from "react-icons/hi2";

// --- UI SUB-COMPONENTS ---
// Breaking the UI into smaller components makes the code cleaner and easier to manage.

const PortfolioHeader = ({ username, portfolioValue, pnl, pnlPercent }) => (
  <div className="portfolio-header">
    <div className="header-left">
      <span className="welcome-back">Welcome back,</span>
      <h1 className="username">{username?.toUpperCase() || "Trader"}</h1>
    </div>
    <div className="header-right">
      <div className="portfolio-value-card">
        <div className="card-label">
          <HiOutlineWallet />
          <span>Total Portfolio Value</span>
        </div>
        <span className="value">${portfolioValue.toLocaleString()}</span>
      </div>
      <div className="pnl-card">
        <div className="card-label">
          {pnl >= 0 ? <HiArrowTrendingUp /> : <HiArrowTrendingDown />}
          <span>24h P&L</span>
        </div>
        <span className={`value ${pnl >= 0 ? "text-green" : "text-red"}`}>
          ${pnl.toLocaleString()} ({pnlPercent}%)
        </span>
      </div>
    </div>
  </div>
);

const IconSummaryCard = ({ icon, label, value }) => (
  <div className="summary-card">
    <div className="card-icon">{icon}</div>
    <div className="card-content">
      <span className="label">{label}</span>
      <span className="value">${value.toLocaleString()}</span>
    </div>
  </div>
);

const AccountSummary = ({ availableMargin, totalCollateral, buyingPower }) => (
  <div className="account-summary">
    <IconSummaryCard
      icon={<HiOutlineBanknotes />}
      label="Available Margin"
      value={availableMargin}
    />
    <IconSummaryCard
      icon={<HiOutlineShieldCheck />}
      label="Total Collateral"
      value={totalCollateral}
    />
    <IconSummaryCard
      icon={<HiOutlineBolt />}
      label="Buying Power"
      value={buyingPower}
    />
  </div>
);

const HistoryTabs = ({ activeTab, setActiveTab }) => (
  <div className="history-tabs">
    <button
      className={activeTab === "positions" ? "active" : ""}
      onClick={() => setActiveTab("positions")}
    >
      <HiOutlineRectangleStack /> Open Positions
    </button>
    <button
      className={activeTab === "trades" ? "active" : ""}
      onClick={() => setActiveTab("trades")}
    >
      <HiOutlineArrowsRightLeft /> Trade History
    </button>
  </div>
);

// Position row component with unrealized PnL calculation
const PositionRow = ({ pos }) => {
  const { price: markPrice } = useMarkPrice(pos.vammAddress);

  const entryPrice = parseFloat(pos.entryPriceX18);
  const absSize = Math.abs(parseFloat(pos.size));
  const currentPrice = markPrice ? parseFloat(markPrice) : 0;
  const margin = parseFloat(pos.margin);
  const realizedPnL = parseFloat(pos.realizedPnL);

  // Calculate unrealized PnL (same formula as PositionPanel)
  const unrealizedPnL = currentPrice > 0
    ? pos.isLong
      ? (currentPrice - entryPrice) * absSize
      : (entryPrice - currentPrice) * absSize
    : 0;

  return (
    <tr key={pos.marketId}>
      <td>{pos.marketName}</td>
      <td className={pos.isLong ? "text-green" : "text-red"}>
        <div className="side-cell">
          {pos.isLong ? <HiArrowUp /> : <HiArrowDown />}{" "}
          {pos.isLong ? "Long" : "Short"}
        </div>
      </td>
      <td>{absSize.toFixed(4)}</td>
      <td>${entryPrice.toFixed(2)}</td>
      <td>${currentPrice > 0 ? currentPrice.toFixed(2) : "..."}</td>
      <td>${margin.toFixed(2)}</td>
      <td className={unrealizedPnL >= 0 ? "text-green" : "text-red"}>
        ${unrealizedPnL.toFixed(2)}
      </td>
      <td className={realizedPnL >= 0 ? "text-green" : "text-red"}>
        ${realizedPnL.toFixed(2)}
      </td>
    </tr>
  );
};

// --- MAIN PORTFOLIO PAGE COMPONENT ---

const PortfolioPage = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("positions");
  const [tradeHistory, setTradeHistory] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  // Get wallet connection and blockchain data
  const { address, isConnected } = useAccount();
  const { positions, isLoading: positionsLoading } = useAllPositions();
  const { accountValue, isLoading: accountLoading } = useAccountValue();

  useEffect(() => {
    // Fetch the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for authentication state changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch user profile when the session is available
    if (session?.user) {
      supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) console.warn("Error fetching profile:", error.message);
          if (data) setProfile(data);
        });
    }
  }, [session]);

  useEffect(() => {
    // Fetch trade history from Supabase
    const fetchTradeHistory = async () => {
      if (!address) return;

      setTradesLoading(true);
      try {
        const { data, error } = await supabase
          .from("trade_history")
          .select("*")
          .eq("user_address", address.toLowerCase())
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          console.warn("Error fetching trades:", error.message);
        } else {
          setTradeHistory(data || []);
        }
      } catch (err) {
        console.warn("Error fetching trades:", err);
      } finally {
        setTradesLoading(false);
      }
    };

    fetchTradeHistory();
  }, [address]);

  const renderContent = () => {
    switch (activeTab) {
      case "positions":
        return (
          <div className="table-container">
            {positionsLoading ? (
              <div className="loading-state">Loading positions...</div>
            ) : positions.length === 0 ? (
              <div className="empty-state">No open positions</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Entry Price</th>
                    <th>Mark Price</th>
                    <th>Margin</th>
                    <th>Unrealized P&L</th>
                    <th>Realized P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <PositionRow key={pos.marketId} pos={pos} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case "trades":
        return (
          <div className="table-container">
            {tradesLoading ? (
              <div className="loading-state">Loading trade history...</div>
            ) : tradeHistory.length === 0 ? (
              <div className="empty-state">No trade history available</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Notional</th>
                    <th>Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trade, index) => (
                    <tr key={trade.id || index}>
                      <td>{new Date(trade.created_at).toLocaleString()}</td>
                      <td>{trade.market}</td>
                      <td
                        className={
                          trade.side === "Long" ? "text-green" : "text-red"
                        }
                      >
                        <div className="side-cell">
                          {trade.side === "Long" ? (
                            <HiArrowUp />
                          ) : (
                            <HiArrowDown />
                          )}{" "}
                          {trade.side}
                        </div>
                      </td>
                      <td>{parseFloat(trade.size).toFixed(4)}</td>
                      <td>${parseFloat(trade.price).toFixed(2)}</td>
                      <td>${parseFloat(trade.notional).toFixed(2)}</td>
                      <td>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${trade.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-link"
                        >
                          {trade.tx_hash?.slice(0, 6)}...
                          {trade.tx_hash?.slice(-4)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Calculate portfolio metrics from real data
  const totalValue = parseFloat(accountValue) || 0;
  const totalMargin = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.margin),
    0
  );
  const totalPnL = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.realizedPnL),
    0
  );
  const availableMargin = totalValue - totalMargin;
  const buyingPower = totalValue * 10; // Assuming 10x leverage

  // For 24h P&L, you'd need to store historical data or calculate from price changes
  // This is a placeholder - ideally fetch from your backend
  const pnl24h = totalPnL; // You can improve this later
  const pnl24hPercent =
    totalValue > 0 ? ((pnl24h / totalValue) * 100).toFixed(2) : 0;

  if (!isConnected) {
    return (
      <main className="portfolio-page-main">
        <div className="not-connected-state">
          <h2>Please connect your wallet to view your portfolio</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="portfolio-page-main">
      <PortfolioHeader
        username={profile?.username}
        portfolioValue={totalValue}
        pnl={pnl24h}
        pnlPercent={pnl24hPercent}
      />
      <AccountSummary
        availableMargin={availableMargin}
        totalCollateral={totalValue}
        buyingPower={buyingPower}
      />
      <div className="portfolio-content-panel">
        <HistoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {renderContent()}
      </div>
    </main>
  );
};

export default PortfolioPage;
