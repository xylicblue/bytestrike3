import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";
import "./WelcomeModal.css";

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const steps = [
    {
      title: "Connect to ByteStrike",
      subtitle: "Link Your Wallet",
      icon: "🔗",
      content: (
        <>
          <div className="step-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Connect Your Wallet</h4>
                <p>
                  Click the <strong>"Connect Wallet"</strong> button in the
                  top-right corner
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Select Your Wallet</h4>
                <p>
                  Choose your wallet from the available options and approve the
                  connection
                </p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Switch to Sepolia Network</h4>
                <p>
                  If you see a "Wrong Network" warning, click{" "}
                  <strong>"Switch to Sepolia"</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="success-indicator">
            <div className="success-icon">✓</div>
            <p>
              <strong>Verification:</strong> You should see your wallet address
              displayed with a green status indicator
            </p>
          </div>
        </>
      ),
    },
    {
      title: "Get Sepolia ETH",
      subtitle: "Gas Fees for Transactions",
      icon: "💎",
      content: (
        <>
          <p className="welcome-intro">
            You need Sepolia ETH to pay for transaction gas fees. We've made it
            easy for you!
          </p>

          <div className="mint-section">
            <div className="mint-card">
              <h3>Get Test ETH (Recommended)</h3>
              <p>
                Use the built-in <strong>"Get Test ETH"</strong> button in the
                Collateral Manager panel
              </p>

              <div className="mint-steps">
                <div className="mini-step">
                  <span className="mini-number">1</span>
                  <span>Find "Need Test ETH?" in the Collateral panel</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">2</span>
                  <span>Click "Get Test ETH" button</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">3</span>
                  <span>Receive 0.04 ETH automatically!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-box success">
            <p>
              <strong>No external faucets needed!</strong> ByteStrike provides
              free test ETH directly. You can request once every 24 hours if
              your balance is below 0.05 ETH.
            </p>
          </div>

          <details className="alternative-faucets">
            <summary>Alternative: External Faucets (if needed)</summary>
            <div className="faucet-grid">
              <div className="faucet-card">
                <div className="faucet-header">
                  <h4>Alchemy Faucet</h4>
                </div>
                <p className="faucet-amount">0.5 ETH</p>
                <p className="faucet-desc">
                  Sign in with Alchemy (free account)
                </p>
                <a
                  href="https://sepoliafaucet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faucet-link"
                >
                  Get ETH →
                </a>
              </div>

              <div className="faucet-card">
                <div className="faucet-header">
                  <h4>Google Cloud</h4>
                </div>
                <p className="faucet-amount">0.05 ETH</p>
                <p className="faucet-desc">Sign in with Google account</p>
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faucet-link"
                >
                  Get ETH →
                </a>
              </div>
            </div>
          </details>
        </>
      ),
    },
    {
      title: "Get Test USDC",
      subtitle: "Your Trading Capital",
      icon: "💰",
      content: (
        <>
          <p className="welcome-intro">
            ByteStrike uses mock USDC for trading on testnet. Get started with
            free test tokens!
          </p>

          <div className="mint-section">
            <div className="mint-card">
              <div className="mint-icon">🪙</div>
              <h3>Mint 10,000 USDC</h3>
              <p>
                Look for the <strong>"Mint 10,000 USDC"</strong> button in the
                trading panel
              </p>

              <div className="mint-steps">
                <div className="mini-step">
                  <span className="mini-number">1</span>
                  <span>Click the Mint button</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">2</span>
                  <span>Confirm transaction in your wallet</span>
                </div>
                <div className="mini-step">
                  <span className="mini-number">3</span>
                  <span>Wait ~15 seconds for confirmation</span>
                </div>
              </div>
            </div>

            <div className="next-steps-box">
              <h4>After Minting</h4>
              <ol>
                <li>
                  <strong>Approve USDC:</strong> Click "Approve USDC" to allow
                  the platform to use your tokens
                </li>
                <li>
                  <strong>Deposit Collateral:</strong> Deposit 1,000-5,000 USDC
                  to start trading
                </li>
                <li>
                  <strong>Start Trading:</strong> Open your first position with
                  as little as 0.1 ETH!
                </li>
              </ol>
            </div>
          </div>

          <div className="info-box success">
            <p>
              <strong>Remember:</strong> The ~$2 ETH you used is still in your
              wallet and fully refundable. You're not paying gas fees - this
              small amount just proves you're a real person, not a bot.
            </p>
          </div>

          <div className="info-box warning">
            <span className="info-icon">⚠️</span>
            <p>
              <strong>Important:</strong> This is testnet. All tokens and trades
              are for practice only - no real money involved!
            </p>
          </div>
        </>
      ),
    },
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={`welcome-modal-overlay ${isClosing ? "closing" : ""}`}>
      <div className={`welcome-modal ${isClosing ? "closing" : ""}`}>
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="modal-header">
          <div className="header-icon">{steps[currentStep].icon}</div>
          <h2 className="modal-title">{steps[currentStep].title}</h2>
          <p className="modal-subtitle">{steps[currentStep].subtitle}</p>
        </div>

        <div className="progress-bar">
          <div className="progress-track">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index <= currentStep ? "active" : ""
                } ${index < currentStep ? "completed" : ""}`}
                onClick={() => setCurrentStep(index)}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-content">
          <div className="step-content-wrapper">
            {steps[currentStep].content}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <div className="step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="footer-actions">
            <Link to="/guide" className="btn-guide">
              View Full Guide
            </Link>
            <button className="btn-primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WelcomeModal;
