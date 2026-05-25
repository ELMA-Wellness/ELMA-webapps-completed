import React from "react";
//@ts-ignore
import "../../css/CompleteSessionConfirmationModal.css";
import { IoClose, IoCheckmarkOutline } from "react-icons/io5";

type Props = {
  visible?: boolean;
  onMarkAsComplete?: () => void;
  onSkip?: () => void;
};

const CompleteSessionConfirmationModal: React.FC<Props> = ({
  visible = false,
  onMarkAsComplete = () => {},
  onSkip = () => {},
}) => {
  if (!visible) return null;

  return (
    <div className="session-modal-overlay">
      <div className="session-modal-container">

        {/* Header */}
        <div className="session-modal-header">
          <button
            className="session-close-btn"
            onClick={onSkip}
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
            Mark Session as Complete
          </h2>

          <p className="session-modal-description">
            Your session has ended successfully. Please confirm completion to
            save session details, update records, and continue smoothly.
          </p>
        </div>

        {/* Footer */}
        <div className="session-modal-footer">
          <button
            className="session-complete-btn"
            onClick={onMarkAsComplete}
          >
            <IoCheckmarkOutline size={18} />
            <span>Mark As Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteSessionConfirmationModal;