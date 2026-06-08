import React, { useEffect } from "react";

interface NotesModalProps {
  visible: boolean;
  onClose: () => void;
  notesText: string;
  setNotesText: (value: string) => void;
}

const SessionNotesModal: React.FC<NotesModalProps> = ({
  visible,
  onClose,
  notesText,
  setNotesText,
}) => {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handle} />

        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Session Notes</h3>
            <p style={styles.subtitle}>Saved on call end</p>
          </div>

          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Start writing professional session notes…"
            style={styles.textArea}
          />
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 999,
    backdropFilter: "blur(4px)",
  },

  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "80vh",
    background: "#F9F7FC",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 -8px 30px rgba(0,0,0,0.18)",
    animation: "slideUp 0.25s ease-out",
  },

  handle: {
    width: 52,
    height: 6,
    borderRadius: 10,
    background: "#D7D2E4",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px 16px",
    borderBottom: "1px solid #ECE7F4",
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#1F1B2E",
  },

  subtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#8A839B",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    background: "#EFEAF7",
    cursor: "pointer",
    fontSize: 18,
    color: "#555",
  },

  content: {
    flex: 1,
    padding: 20,
    overflow: "auto",
  },

  textArea: {
    width: "100%",
    minHeight: "100%",
    resize: "none",
    padding: 16,
    borderRadius: 16,
    border: "1px solid #ECE7F4",
    background: "#FFF",
    fontSize: 16,
    lineHeight: "24px",
    color: "#1F1B2E",
    outline: "none",
    boxSizing: "border-box",
  },
};

export default SessionNotesModal;