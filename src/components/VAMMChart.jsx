import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { supabase } from "../creatclient";

const VAMMChart = ({ market = "H100-GPU-PERP" }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [priceChangePercent, setPriceChangePercent] = useState(null);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [timeRange, setTimeRange] = useState("1h");

  const isPriceUp = priceChange !== null && priceChange >= 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let minutesAgo;
        if (timeRange === "7d") minutesAgo = 7 * 24 * 60;
        else if (timeRange === "1d") minutesAgo = 24 * 60;
        else if (timeRange === "4h") minutesAgo = 4 * 60;
        else if (timeRange === "1h") minutesAgo = 60;
        else minutesAgo = 2; // 2m default

        const startTime = new Date(
          Date.now() - minutesAgo * 60 * 1000
        ).toISOString();

        const { data, error } = await supabase
          .from("vamm_price_history")
          .select("price, twap, timestamp")
          .eq("market", market)
          .gte("timestamp", startTime)
          .order("timestamp", { ascending: true });

        if (error) throw error;
        if (!data || data.length < 2) {
          throw new Error("Not enough data");
        }

        setHasEnoughData(true);

        // Get current price
        const latestEntry = data[data.length - 1];
        const livePrice = parseFloat(latestEntry.price);
        setCurrentPrice(livePrice);

        // Calculate price change
        const openingEntry = data[0];
        const openingPrice = parseFloat(openingEntry.price);
        const absoluteChange = livePrice - openingPrice;
        setPriceChange(absoluteChange);

        if (openingPrice !== 0) {
          const percentChange = (absoluteChange / openingPrice) * 100;
          setPriceChangePercent(percentChange);
        } else {
          setPriceChangePercent(0);
        }

        // Convert to candlestick format
        // Group data into candles based on time range
        const candleData = convertToCandlesticks(data, timeRange);
        setChartData(candleData);
      } catch (error) {
        console.error("Error fetching vAMM data:", error.message);
        setCurrentPrice(null);
        setHasEnoughData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel("vamm_price_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vamm_price_history",
          filter: `market=eq.${market}`,
        },
        (payload) => {
          // Update current price on new data
          setCurrentPrice(parseFloat(payload.new.price));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange, market]);

  // Convert raw price data to candlestick format
  const convertToCandlesticks = (data, range) => {
    if (!data || data.length === 0) return [];

    // Determine candle interval in seconds
    let intervalSeconds;
    switch (range) {
      case "2m":
        intervalSeconds = 15; // 15-second candles for 2m view
        break;
      case "1h":
        intervalSeconds = 5 * 60; // 5-minute candles for 1h view
        break;
      case "4h":
        intervalSeconds = 15 * 60; // 15-minute candles for 4h view
        break;
      case "1d":
        intervalSeconds = 60 * 60; // 1-hour candles for 1d view
        break;
      case "7d":
        intervalSeconds = 4 * 60 * 60; // 4-hour candles for 7d view
        break;
      default:
        intervalSeconds = 15;
    }

    const candles = [];
    let currentCandle = null;

    data.forEach((point) => {
      const timestamp = new Date(point.timestamp);
      const price = parseFloat(point.price);

      // Round timestamp to interval
      const intervalMs = intervalSeconds * 1000;
      const candleTime = new Date(
        Math.floor(timestamp.getTime() / intervalMs) * intervalMs
      );

      if (
        !currentCandle ||
        currentCandle.x.getTime() !== candleTime.getTime()
      ) {
        // Start new candle
        if (currentCandle) {
          candles.push(currentCandle);
        }
        currentCandle = {
          x: candleTime,
          y: [price, price, price, price], // [open, high, low, close]
        };
      } else {
        // Update existing candle
        currentCandle.y[1] = Math.max(currentCandle.y[1], price); // high
        currentCandle.y[2] = Math.min(currentCandle.y[2], price); // low
        currentCandle.y[3] = price; // close
      }
    });

    // Push last candle
    if (currentCandle) {
      candles.push(currentCandle);
    }

    return candles;
  };

  const chartOptions = {
    chart: {
      type: "candlestick",
      height: 350,
      zoom: { enabled: true },
      toolbar: { show: false },
      animations: { enabled: true },
      background: "transparent",
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22c55e", // Green for up
          downward: "#ef4444", // Red for down
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#a0aec0" },
        format:
          timeRange === "2m"
            ? "HH:mm:ss"
            : timeRange === "1h" || timeRange === "4h"
            ? "HH:mm"
            : "MMM dd HH:mm",
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#a0aec0" },
        formatter: (val) => `$${val.toFixed(2)}`,
      },
      opposite: true,
      tooltip: { enabled: true },
    },
    grid: {
      borderColor: "#2d3748",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      x: { format: "MMM dd, HH:mm" },
    },
  };

  return (
    <section className="vamm-chart-section">
      <div className="content-container">
        <div className="price-display-header">
          <div className="price-title">
            <h2>vAMM Mark Price</h2>
            <span className="market-badge">{market}</span>
          </div>
          <div className="price-value">
            <h4>Mark Price</h4>
            <div className="price-main">
              <h1>
                {loading
                  ? "..."
                  : currentPrice !== null
                  ? `$${currentPrice.toFixed(2)}/hr`
                  : "N/A"}
              </h1>
              {hasEnoughData &&
                priceChange !== null &&
                priceChangePercent !== null && (
                  <div
                    className={`price-change-chip ${
                      isPriceUp ? "price-up" : "price-down"
                    }`}
                  >
                    <span className="absolute-change">
                      {isPriceUp ? "▲" : "▼"} $
                      {Math.abs(priceChange).toFixed(2)}
                    </span>
                    <span className="percent-change">
                      ({priceChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="time-range-toggles">
          <button
            onClick={() => setTimeRange("1h")}
            className={timeRange === "1h" ? "active" : ""}
          >
            1H
          </button>
          <button
            onClick={() => setTimeRange("4h")}
            className={timeRange === "4h" ? "active" : ""}
          >
            4H
          </button>
          <button
            onClick={() => setTimeRange("1d")}
            className={timeRange === "1d" ? "active" : ""}
          >
            1D
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={timeRange === "7d" ? "active" : ""}
          >
            7D
          </button>
        </div>

        <div id="price-chart-container">
          {loading ? (
            <p className="chart-message">Loading vAMM Data...</p>
          ) : hasEnoughData ? (
            <Chart
              options={chartOptions}
              series={[{ name: "Price", data: chartData }]}
              type="candlestick"
              height={350}
            />
          ) : (
            <div className="chart-message-container">
              <p className="chart-message">
                Not enough vAMM data yet. Prices are being recorded - check back
                soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VAMMChart;
