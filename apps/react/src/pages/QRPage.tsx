import React, { useEffect, useRef } from "react";
import QRCode from 'react-qr-code';
//@ts-ignore
import "../styles/SessionExpired.css";
import { useSearchParams } from "react-router-dom";

const QRPage: React.FC = () => {
    const [params] = useSearchParams();

    const sessionCode = params.get("sessionCode");
    const userId = params.get("userId");
    const role = params.get("role");
    const name = params.get("name")
    const profession = params.get("profession")
    const startTime = params.get("startTime");
    const email = params.get("email")
    const photo = params.get("photo")
    const therapistPhoto = params.get("therapistPhoto")
    const clientPhoto = params.get("patientPhoto")
    const tname = params.get("therapistName")
    const cname = params.get("patientName")
    const temail = params.get("therapistEmail")
    const cemail = params.get("patientEmail")


    const commonQueryParams={
        patientPhoto : clientPhoto,
        therapistPhoto,
        patientName : cname,
        therapistName : tname,
        therapistEmail: temail,
        patientEmail : cemail
        
    }

    const skills =
        JSON.parse(
            decodeURIComponent(params.get("skills") || "[]")
        );


    const onContactSupport = () => {
        try {
            window.open('https://mail.google.com/mail/?view=cm&fs=1&to=support@elma.ltd');
        } catch (error) {
            console.error('Failed to open mail app:', error);
            alert('Unable to open mail app.');
        }
    };

    // Construct the dynamic session link for the QR code
    const sessionLink =
        `https://elma.ltd/session-join?` +
        `sessionCode=${encodeURIComponent(sessionCode || '')}` +
        `&userId=${encodeURIComponent(userId || '')}` +
        `&role=${encodeURIComponent(role || '')}` +
        `&name=${encodeURIComponent(name || '')}` +
        `&skills=${encodeURIComponent(JSON.stringify(skills))}` + // Ensure skills array is stringified and encoded
        `&profession=${encodeURIComponent(profession || '')}` +
        `&startTime=${encodeURIComponent(startTime || '')}` +
        `&email=${encodeURIComponent(email || '')}` +
        `&photo=${encodeURIComponent(photo || '')}` + `&patientName=${encodeURIComponent(commonQueryParams.patientName || "")}` +
        `&patientPhoto=${encodeURIComponent(commonQueryParams.patientPhoto || "")}` +
        `&patientEmail=${encodeURIComponent(commonQueryParams.patientEmail || "")}` +

        `&therapistName=${encodeURIComponent(commonQueryParams.therapistName || "")}` +
        `&therapistPhoto=${encodeURIComponent(commonQueryParams.therapistPhoto || "")}` +
        `&therapistEmail=${encodeURIComponent(commonQueryParams.therapistEmail || "")}`;

    // Note: commonQueryParams was undefined in the provided context and has been removed for a functional solution.
    // If commonQueryParams are needed, they should be defined or extracted from useSearchParams similarly.

    return (
        <div className="se-root">
            {/* Background glow orb */}
            <div className="se-bg-orb" />
            <div className="se-bg-orb-secondary" />

            <div className="se-card">
                {/* Logo */}
                <div className="se-logo-wrap">
                    <img style={{ height: 70, width: 154 }} src="https://res.cloudinary.com/dnzy9hf2x/image/upload/v1779178463/app-images_2FELMA_logos_tv3kyj.webp" />
                    <span className="se-logo-heart">♡</span>
                </div>

                {/* QR Code Section - Enhanced Quality */}
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '24px', margin: '0 auto 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 12px 40px rgba(7, 17, 46, 0.12)' }}>
                        <QRCode
                            value={sessionLink} // Use the dynamically constructed URL
                            size={256}
                            style={{ height: "auto", maxWidth: "180px", width: "100%" }}
                            viewBox={`0 0 256 256`}
                            bgColor="#ffffff" // Explicitly set background color for clarity
                            fgColor="#07112E"
                            level="M" // Balanced error correction for high-density URLs
                        />
                </div>

                {/* Content */}
                <div className="se-content">
                    <p className="se-subtitle">
                        scan this QR code to continue with your session on your mobile device, kindly make sure you scan with the same device on which you run the “Elma” Emotional Companion app
                    </p>

                    <div className="se-divider-heart">♡</div>

                    <p className="se-help-text">We are continuously working on increasing the horizon of operating systems and devices on which you can access your therapy sessions online seamlessly
 </p>

                    {/* <button onClick={onContactSupport} className="se-btn-support">
                        <ChatIcon />
                        Contact Support
                    </button> */}
                </div>

                
            </div>
        </div>
    );
};

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

export default QRPage;