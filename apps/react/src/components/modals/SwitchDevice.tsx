import React from "react";
//@ts-ignore
import "../../css/CompleteSessionConfirmationModal.css";
import { IoClose, IoLaptopOutline } from "react-icons/io5";


interface DeviceSwitchProps {
  visible: boolean;
  toDevice: "mobile" | "web";
  onClose: () => void;
  onContinue :()=>void;
}

const DeviceSwitch: React.FC<DeviceSwitchProps> = ({
  visible,
  toDevice,
  onClose,
  onContinue
}) => {
  if (!visible) return null;



  const deviceLabel =
    toDevice === "web"
      ? "Computer"
      : "Mobile Device";

  return (
    <div className="session-modal-overlay">
      <div className="session-modal-container">
        {/* Header */}
        <div className="session-modal-header">
          <button
            className="session-close-btn"
            onClick={onClose}
          >
            <IoClose size={22} />
          </button>

          <img
            src="https://res.cloudinary.com/dnzy9hf2x/image/upload/v1779178463/app-images_2FELMA_logos_tv3kyj.webp"
            alt="ELMA"
            className="session-logo"
          />
        </div>

        {/* Content */}
        <div className="session-modal-content">
          <h2 className="session-modal-title">
            Session Moved to Another Device

          </h2>

          <p className="session-modal-description">
            Your account has started this session on a {deviceLabel}. To keep your information secure and prevent duplicate connections, this device has been disconnected automatically.
            {"\n\n"}
            Please continue your session on the {deviceLabel} where it was recently opened.
          </p>


        </div>

        {/* Footer */}
        <div className="session-modal-footer">
          <button
            className="session-skip-btn"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="session-complete-btn"
            onClick={onContinue}
          >

            <IoLaptopOutline size={18} />
            <span>Continue On Web</span>

          </button>


        </div>
      </div>
    </div>
  );
};

export default DeviceSwitch;