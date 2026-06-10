import React from "react";
import { MdHome } from "react-icons/md";
import { useNavigate } from "react-router-dom";


const styles = `
  .sc-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
    radial-gradient(ellipse 85% 55% at 50% 115%, #c026d3 0%, #7e22ce 28%, transparent 65%),
    radial-gradient(ellipse 60% 45% at 50% 110%, #e879f9 0%, transparent 55%),
    linear-gradient(175deg, #120826 0%, #1c0838 35%, #2a0d55 65%, #1e0a40 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 24px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  .sc-bg-orb {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(72, 199, 142, 0.18) 0%, transparent 70%);
    top: -100px;
    right: -100px;
    pointer-events: none;
  }

  .sc-bg-orb-secondary {
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(72, 199, 142, 0.1) 0%, transparent 70%);
    bottom: -80px;
    left: -80px;
    pointer-events: none;
  }

  .sc-card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px 36px;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .sc-logo-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }

  .sc-logo-heart {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1;
  }

  .sc-orbit-container {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
  }

  .sc-orbit-ring {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid rgba(72, 199, 142, 0.25);
  }

  .sc-orbit-ring--outer {
    width: 110px;
    height: 110px;
    animation: sc-spin 10s linear infinite;
  }

  .sc-orbit-ring--inner {
    width: 78px;
    height: 78px;
    animation: sc-spin-reverse 7s linear infinite;
    border-color: rgba(72, 199, 142, 0.15);
  }

  @keyframes sc-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes sc-spin-reverse {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }

  .sc-orbit-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background: rgba(72, 199, 142, 0.8);
    border-radius: 50%;
  }

  .sc-orbit-dot--1 {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  .sc-orbit-dot--2 {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
  }

  .sc-check-circle {
    position: relative;
    z-index: 2;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(72, 199, 142, 0.25), rgba(72, 199, 142, 0.1));
    border: 1.5px solid rgba(72, 199, 142, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sc-content {
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .sc-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(72, 199, 142, 0.15);
    border: 1px solid rgba(72, 199, 142, 0.3);
    border-radius: 100px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(72, 199, 142, 0.95);
    letter-spacing: 0.3px;
    margin-bottom: 4px;
  }

  .sc-badge-dot {
    width: 6px;
    height: 6px;
    background: rgba(72, 199, 142, 0.9);
    border-radius: 50%;
  }

  .sc-title {
    font-size: 22px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    letter-spacing: -0.3px;
    line-height: 1.3;
  }

  .sc-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    line-height: 1.65;
  }

  .sc-divider-heart {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.2);
    margin: 4px 0;
  }

  .sc-help-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
  }

  .sc-btn-support {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 12px 24px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
    margin-top: 4px;
    font-family: inherit;
  }

  .sc-btn-support:hover {
    background: rgba(255, 255, 255, 0.13);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .sc-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    width: 100%;
  }

  .sc-footer-heart {
    font-size: 14px;
    color: rgba(72, 199, 142, 0.6);
  }

  .sc-footer-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    margin: 0;
  }
`;

const SessionCompleted: React.FC = () => {
    const navigate=useNavigate()
    const onContactSupport = () => {
        try {
            window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@elma.ltd');
        } catch (error) {
            console.error('Failed to open mail app:', error);
            alert('Unable to open mail app.');
        }
    };

    const goHome=()=>{
        navigate('/')

    }

    return (
        <>
            <style>{styles}</style>
            <div className="sc-root">
                {/* Background glow orbs */}
                <div className="sc-bg-orb" />
                <div className="sc-bg-orb-secondary" />

                <div className="sc-card">
                    {/* Logo */}
                    <div className="sc-logo-wrap">
                        <img
                            style={{ height: 70, width: 154 }}
                            src="https://res.cloudinary.com/dnzy9hf2x/image/upload/v1779178463/app-images_2FELMA_logos_tv3kyj.webp"
                            alt="ELMA logo"
                        />
                        <span className="sc-logo-heart">♡</span>
                    </div>

                    {/* Check orbit illustration */}
                    <div className="sc-orbit-container">
                        <div className="sc-orbit-ring sc-orbit-ring--outer">
                            <div className="sc-orbit-dot sc-orbit-dot--1" />
                            <div className="sc-orbit-dot sc-orbit-dot--2" />
                        </div>
                        <div className="sc-orbit-ring sc-orbit-ring--inner" />
                        <div className="sc-check-circle">
                            <CheckIcon />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="sc-content">
                        <div className="sc-badge">
                            <div className="sc-badge-dot" />
                            Session complete
                        </div>

                        <h1 className="sc-title">You're all done!</h1>
                        <p className="sc-subtitle">
                            This session has been successfully completed.
                            <br />
                            Thank you for your time and participation.
                        </p>

                        <div className="sc-divider-heart">♡</div>

                        <p className="sc-help-text">Need help or have questions?</p>

                        <button onClick={onContactSupport} className="sc-btn-support">
                            <ChatIcon />
                            Contact Support
                        </button>
                        <button onClick={goHome} className="sc-btn-support">
                            <MdHome size={22} />
                            Home
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="sc-footer">
                        <span className="sc-footer-heart">♡</span>
                        <p className="sc-footer-text">We're here to support you.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

const CheckIcon: React.FC = () => (
    <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle
            cx="15"
            cy="15"
            r="13"
            stroke="rgba(72,199,142,0.8)"
            strokeWidth="1.5"
        />
        <polyline
            points="8,15 13,20 22,10"
            stroke="rgba(72,199,142,0.95)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const ChatIcon: React.FC = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default SessionCompleted;