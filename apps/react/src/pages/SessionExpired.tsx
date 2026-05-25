import React, { useEffect, useRef } from "react";
//@ts-ignore
import "../styles/SessionExpired.css";

const SessionExpiredWeb: React.FC = () => {
    const orbitRef = useRef<HTMLDivElement>(null);


   const onContactSupport = () => {
  try {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@elma.ltd');
  } catch (error) {
    console.error('Failed to open mail app:', error);
    alert('Unable to open mail app.');
  }
};

    return (
        <div className="se-root">
            {/* Background glow orb */}
            <div className="se-bg-orb" />
            <div className="se-bg-orb-secondary" />

            <div className="se-card">
                {/* Logo */}
                <div className="se-logo-wrap">
                    <img style={{height:70,width:154}} src="https://res.cloudinary.com/dnzy9hf2x/image/upload/v1779178463/app-images_2FELMA_logos_tv3kyj.webp" />
                    <span className="se-logo-heart">♡</span>
                </div>

                {/* Clock orbit illustration */}
                <div className="se-orbit-container">
                    {/* Outer orbit ring */}
                    <div className="se-orbit-ring se-orbit-ring--outer">
                        <div className="se-orbit-dot se-orbit-dot--1" />
                        <div className="se-orbit-dot se-orbit-dot--2" />
                    </div>
                    {/* Inner orbit ring */}
                    <div className="se-orbit-ring se-orbit-ring--inner" />
                    {/* Clock circle */}
                    <div className="se-clock-circle">
                        <ClockIcon />
                    </div>
                </div>

                {/* Content */}
                <div className="se-content">
                    <h1 className="se-title">This session has expired</h1>
                    <p className="se-subtitle">
                        The time for this session has passed or
                        <br />
                        it has already been completed.
                    </p>

                    <div className="se-divider-heart">♡</div>

                    <p className="se-help-text">Need help or have questions?</p>

                    <button onClick={onContactSupport} className="se-btn-support">
                        <ChatIcon />
                        Contact Support
                    </button>
                </div>

                {/* Footer */}
                <div className="se-footer">
                    <span className="se-footer-heart">♡</span>
                    <p className="se-footer-text">We're here to support you.</p>
                </div>
            </div>
        </div>
    );
};

const ClockIcon: React.FC = () => (
    <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle
            cx="22"
            cy="22"
            r="19"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
        />
        <line
            x1="22"
            y1="22"
            x2="22"
            y2="11"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <line
            x1="22"
            y1="22"
            x2="30"
            y2="27"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <circle cx="22" cy="22" r="2" fill="rgba(255,255,255,0.9)" />
        {/* Tick marks */}
        <line x1="22" y1="4" x2="22" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="37" x2="22" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="22" x2="7" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="37" y1="22" x2="40" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
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
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default SessionExpiredWeb;