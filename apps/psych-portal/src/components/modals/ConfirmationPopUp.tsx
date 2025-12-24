import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import "./ConfirmationModal.css";

type ConfirmationModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = "Mark as Completed",
  message = "Do you want to mark this session as completed?",
  confirmText = "Yes, Confirm",
  cancelText = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="modal-icon">
          <AlertCircle size={42} />
        </div>

        {/* Content */}
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle size={18} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
