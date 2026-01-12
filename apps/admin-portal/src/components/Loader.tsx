import React from "react";
import { Loader, Loader2 } from "lucide-react";
import "./LoaderModal.css";

const LoaderModal = ({ visible, text = "Loading, please wait..." }) => {
  if (!visible) return null;

  return (
    <div className="loader-backdrop">
      <div className="loader-modal">
        <Loader className="loader-icon" />
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
};

export default LoaderModal;
