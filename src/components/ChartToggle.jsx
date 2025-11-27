import React, { useState } from "react";
import PriceIndexChart from "../chart";
import VAMMChart from "./VAMMChart";
import "./ChartToggle.css";

const ChartToggle = ({ selectedMarket }) => {
  const [activeChart, setActiveChart] = useState("index"); // 'index' or 'vamm'

  // Get market name for vAMM chart - map frontend names to database names
  const frontendMarket =
    typeof selectedMarket === "string"
      ? selectedMarket
      : selectedMarket?.name || "H100-PERP";

  // Map frontend market names to database market names
  const marketNameMap = {
    "H100-PERP": "H100-GPU-PERP",
    "ETH-PERP-V2": "H100-GPU-PERP", // Same vAMM
  };
  const marketName = marketNameMap[frontendMarket] || "H100-GPU-PERP";

  return (
    <div className="chart-toggle-container">
      {/* Toggle Buttons */}
      <div className="chart-toggle-buttons">
        <button
          className={`toggle-btn ${activeChart === "index" ? "active" : ""}`}
          onClick={() => setActiveChart("index")}
        >
          {/* <span className="toggle-icon">📊</span> */}
          Index Price
        </button>
        <button
          className={`toggle-btn ${activeChart === "vamm" ? "active" : ""}`}
          onClick={() => setActiveChart("vamm")}
        >
          {/* <span className="toggle-icon">📈</span> */}
          vAMM Price
        </button>
      </div>

      {/* Chart Display */}
      <div className="chart-display">
        {activeChart === "index" ? (
          <PriceIndexChart />
        ) : (
          <VAMMChart market={marketName} />
        )}
      </div>
    </div>
  );
};

export default ChartToggle;
