import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./guidepage.css";

const GuidePage = () => {
  const [activeSection, setActiveSection] = useState("setup");
  const [isNavSticky, setIsNavSticky] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 140;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector(".guide-hero");
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setIsNavSticky(window.pageYOffset > heroBottom - 100);
      }

      // Update active section based on scroll position
      const sections = ["setup", "connect", "eth", "usdc", "deposit", "trade"];
      const scrollPosition = window.pageYOffset + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="guide-page">
      {/* Hero Section */}
      <div className="guide-hero">
        <div className="guide-hero-content">
          <div className="guide-badge">Complete Guide</div>
          <h1 className="guide-hero-title">
            Getting Started with{" "}
            <span className="gradient-text">ByteStrike</span>
          </h1>
          <p className="guide-hero-subtitle">
            Your complete guide to trading perpetual futures on ByteStrike
            Sepolia Testnet
          </p>
          <div className="guide-hero-meta">
            <div className="meta-item">
              <span className="meta-label">Duration:</span>
              <span>~10 minutes</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Cost:</span>
              <span>Free (testnet)</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Level:</span>
              <span>Beginner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="guide-layout-wrapper">
        {/* Vertical Sidebar Navigation */}
        <div className="guide-sidebar">
          <div className="sidebar-nav">
            <button
              className={`sidebar-item ${
                activeSection === "setup" ? "active" : ""
              }`}
              onClick={() => scrollToSection("setup")}
            >
              <div className="bubble">
                <div className="bubble-inner">1</div>
              </div>
              <span className="sidebar-label">Setup</span>
            </button>
            <div className="connector-line"></div>
            <button
              className={`sidebar-item ${
                activeSection === "connect" ? "active" : ""
              }`}
              onClick={() => scrollToSection("connect")}
            >
              <div className="bubble">
                <div className="bubble-inner">2</div>
              </div>
              <span className="sidebar-label">Connect</span>
            </button>
            <div className="connector-line"></div>
            <button
              className={`sidebar-item ${
                activeSection === "eth" ? "active" : ""
              }`}
              onClick={() => scrollToSection("eth")}
            >
              <div className="bubble">
                <div className="bubble-inner">3</div>
              </div>
              <span className="sidebar-label">Get ETH</span>
            </button>
            <div className="connector-line"></div>
            <button
              className={`sidebar-item ${
                activeSection === "usdc" ? "active" : ""
              }`}
              onClick={() => scrollToSection("usdc")}
            >
              <div className="bubble">
                <div className="bubble-inner">4</div>
              </div>
              <span className="sidebar-label">Get USDC</span>
            </button>
            <div className="connector-line"></div>
            <button
              className={`sidebar-item ${
                activeSection === "deposit" ? "active" : ""
              }`}
              onClick={() => scrollToSection("deposit")}
            >
              <div className="bubble">
                <div className="bubble-inner">5</div>
              </div>
              <span className="sidebar-label">Deposit</span>
            </button>
            <div className="connector-line"></div>
            <button
              className={`sidebar-item ${
                activeSection === "trade" ? "active" : ""
              }`}
              onClick={() => scrollToSection("trade")}
            >
              <div className="bubble">
                <div className="bubble-inner">6</div>
              </div>
              <span className="sidebar-label">Trade</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="guide-content">
          {/* Prerequisites Section */}
          <section id="setup" className="guide-section">
            <div className="section-header">
              <h2>Prerequisites</h2>
              <div className="section-divider"></div>
            </div>

            <div className="content-card">
              <h3>
                <span className="step-number">1</span>
                Wallet Setup
              </h3>
              <p>
                Install <strong>MetaMask</strong> or any Web3 wallet to get
                started.
              </p>
              <div className="info-box blue">
                <div>
                  <p>
                    <strong>Download MetaMask:</strong>{" "}
                    <a
                      href="https://metamask.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      metamask.io
                    </a>
                  </p>
                  <p>Create a new wallet or import existing one</p>
                  <p className="warning-text">
                    ⚠️ Securely backup your seed phrase!
                  </p>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h3>
                <span className="step-number">2</span>
                That's It!
              </h3>
              <p>
                ByteStrike provides everything else you need - including free
                test ETH and test USDC tokens.
              </p>
              <div className="info-box green">
                <div>
                  <p>
                    <strong>No mainnet ETH required!</strong> Unlike other
                    testnet platforms, ByteStrike has a built-in faucet that
                    provides free Sepolia ETH directly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Connect to ByteStrike - Now Step 1 */}
          <section id="connect" className="guide-section">
            <div className="section-header">
              <h2>Step 1: Connect to ByteStrike</h2>
              <div className="section-divider"></div>
            </div>

            <div className="steps-container">
              <div className="step-card">
                <div className="step-icon">1</div>
                <div className="step-content">
                  <h4>Connect Your Wallet</h4>
                  <p>
                    Click the <strong>"Connect Wallet"</strong> button in the
                    top-right corner of the ByteStrike platform.
                  </p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-icon">2</div>
                <div className="step-content">
                  <h4>Select Your Wallet</h4>
                  <p>
                    Choose your wallet from the available options and approve
                    the connection in the popup.
                  </p>
                </div>
              </div>

              <div className="step-card">
                <div className="step-icon">3</div>
                <div className="step-content">
                  <h4>Switch to Sepolia Network</h4>
                  <p>
                    If you see a "Wrong Network" warning, click{" "}
                    <strong>"Switch to Sepolia"</strong> and approve in your
                    wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="info-box green">
              <p>
                <strong>Verification:</strong> You should see your wallet
                address displayed with a green status indicator
              </p>
            </div>
          </section>

          {/* Manual Network Setup Section */}
          <section className="guide-section manual-setup-section">
            <div className="content-card">
              <h3>Manual Network Setup (if needed)</h3>
              <div className="code-box">
                <div className="code-row">
                  <span className="code-label">Network Name:</span>
                  <span className="code-value">Sepolia</span>
                </div>
                <div className="code-row">
                  <span className="code-label">Chain ID:</span>
                  <span className="code-value">11155111</span>
                </div>
                <div className="code-row">
                  <span className="code-label">Currency Symbol:</span>
                  <span className="code-value">ETH</span>
                </div>
                <div className="code-row">
                  <span className="code-label">Block Explorer:</span>
                  <span className="code-value">
                    https://sepolia.etherscan.io
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Get Sepolia ETH - Now Step 2 */}
          <section id="eth" className="guide-section">
            <div className="section-header">
              <h2>Step 2: Get Sepolia ETH</h2>
              <div className="section-divider"></div>
            </div>

            <p className="section-intro">
              You need Sepolia ETH to pay for transaction gas fees. We've made
              this easy with our built-in faucet!
            </p>

            <div className="content-card highlight">
              <h3>
                <span className="step-number">⛽</span>
                Use ByteStrike's Built-in Faucet (Recommended)
              </h3>
              <p>
                Get free test ETH directly from ByteStrike - no external
                accounts needed!
              </p>
              <div className="steps-container">
                <div className="mini-step">
                  <span className="mini-number">1</span>
                  <span>
                    Find "Need Test ETH?" in the Collateral Manager panel
                  </span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">2</span>
                  <span>Click the "Get Test ETH" button</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">3</span>
                  <span>Receive 0.04 ETH automatically (~30 seconds)</span>
                </div>
              </div>
              <div className="info-box green">
                <p>
                  <strong>Rate Limits:</strong> You can request once every 24
                  hours if your balance is below 0.05 ETH. This is enough for
                  many transactions!
                </p>
              </div>
            </div>

            <div className="content-card">
              <h3>Alternative: External Faucets</h3>
              <p>
                If you need more ETH or prefer external sources, you can use
                these faucets:
              </p>

              <div className="faucets-grid">
                <div className="faucet-card-detail">
                  <h4>Alchemy Faucet</h4>
                  <div className="faucet-amount">0.5 ETH</div>
                  <p>Requires Alchemy account (free to create)</p>
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faucet-btn"
                  >
                    Get ETH from Alchemy →
                  </a>
                </div>

                <div className="faucet-card-detail">
                  <h4>Google Cloud Faucet</h4>
                  <div className="faucet-amount">0.05 ETH</div>
                  <p>Sign in with Google account</p>
                  <a
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="faucet-btn"
                  >
                    Get ETH from Google →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Get Test USDC */}
          <section id="usdc" className="guide-section">
            <div className="section-header">
              <h2>Step 3: Get Test USDC</h2>
              <div className="section-divider"></div>
            </div>

            <p className="section-intro">
              ByteStrike uses mock USDC for trading on testnet. Get 10,000 free
              test USDC!
            </p>

            <div className="content-card highlight">
              <h3>Mint 10,000 USDC via Frontend</h3>
              <div className="steps-container">
                <div className="mini-step">
                  <span className="mini-number">1</span>
                  <span>
                    Find the "Mint 10,000 USDC" button in the trading panel
                  </span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">2</span>
                  <span>Click the button</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">3</span>
                  <span>Confirm transaction in your wallet</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">4</span>
                  <span>Wait ~15 seconds for confirmation</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">5</span>
                  <span>You now have 10,000 test USDC!</span>
                </div>
              </div>
            </div>

            <div className="info-box yellow">
              <p>
                <strong>Important:</strong> This is testnet. All tokens and
                trades are for practice only - no real money involved!
              </p>
            </div>
          </section>

          {/* Deposit Collateral */}
          <section id="deposit" className="guide-section">
            <div className="section-header">
              <h2>Step 4: Deposit Collateral</h2>
              <div className="section-divider"></div>
            </div>

            <p className="section-intro">
              Before trading, you must deposit USDC as collateral.
            </p>

            <div className="content-card">
              <h3>
                <span className="step-number">A</span>
                Approve USDC Spending (First Time Only)
              </h3>
              <p>
                The app will prompt you automatically on your first deposit.
                This approves the ClearingHouse contract to spend your USDC.
              </p>
              <div className="info-box">
                <p>
                  You only need to do this once - it approves maximum amount
                </p>
              </div>
            </div>

            <div className="content-card">
              <h3>
                <span className="step-number">B</span>
                Deposit USDC
              </h3>
              <p>
                <strong>Recommended first deposit:</strong> 1,000-5,000 USDC
              </p>
              <div className="steps-container">
                <div className="mini-step">
                  <span className="mini-number">1</span>
                  <span>Navigate to collateral/deposit section</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">2</span>
                  <span>Enter amount (e.g., 5000)</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">3</span>
                  <span>Click "Deposit"</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">4</span>
                  <span>Confirm transaction in your wallet</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">5</span>
                  <span>Wait for confirmation</span>
                </div>
              </div>
            </div>
          </section>

          {/* Open Position */}
          <section id="trade" className="guide-section">
            <div className="section-header">
              <h2>Step 5: Open Your First Position</h2>
              <div className="section-divider"></div>
            </div>
            <p className="section-intro">Now you're ready to trade!</p>
            <div className="content-card">
              <h3>Understanding the Market</h3>
              <div className="market-info">
                <div className="market-item">
                  <span className="market-label">Active Market:</span>
                  <span className="market-value">ETH-PERP-V2</span>
                </div>
                <div className="market-item">
                  <span className="market-label">Current Price:</span>
                  <span className="market-value">~$3.75 (testnet)</span>
                </div>
              </div>
            </div>
            <div className="trade-options">
              <div className="trade-card long">
                <h4>📈 Open Long Position</h4>
                <p>Betting price will go UP</p>
                <div className="steps-container">
                  <div className="mini-step">
                    <span className="mini-number">1</span>
                    <span>Select ETH-PERP-V2 market</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">2</span>
                    <span>Click "Buy" tab</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">3</span>
                    <span>Enter size: 0.1 ETH</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">4</span>
                    <span>Set price limit or leave default</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">5</span>
                    <span>Click "Buy Long" and confirm</span>
                  </div>
                </div>
              </div>

              <div className="trade-card short">
                <h4>📉 Open Short Position</h4>
                <p>Betting price will go DOWN</p>
                <div className="steps-container">
                  <div className="mini-step">
                    <span className="mini-number">1</span>
                    <span>Select ETH-PERP-V2 market</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">2</span>
                    <span>Click "Sell" tab</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">3</span>
                    <span>Enter size: 0.1 ETH</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">4</span>
                    <span>Set price limit or leave default</span>
                  </div>
                  <div className="mini-step">
                    <span className="mini-number">5</span>
                    <span>Click "Sell Short" and confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="guide-cta">
            <h2>Ready to Start Trading?</h2>
            <p>
              You've learned everything you need to know. Let's get started!
            </p>
            <Link to="/trade" className="cta-button">
              Go to Trading Platform →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
