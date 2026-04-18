import { useState } from "react";

const StarIcon = ({ filled, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CalendarIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="14" x2="8" y2="14" strokeWidth="3" strokeLinecap="round" />
    <line x1="12" y1="14" x2="12" y2="14" strokeWidth="3" strokeLinecap="round" />
    <line x1="16" y1="14" x2="16" y2="14" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CheckBadge = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#7c4ddb">
    <circle cx="12" cy="12" r="12" fill="#7c4ddb" />
    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function SessionEnded({ duration = 52, onDone, onBookAgain }) {
  const [rating, setRating]       = useState(0);
  const [hovered, setHovered]     = useState(0);
  const [feedback, setFeedback]   = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (star) => setRating(star);

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) setSubmitted(true);
  };

  return (
    <>
      <style>{`
        .se-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f3f0ff 0%, #ede8fb 50%, #f8f5ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          box-sizing: border-box;
        }
        .se-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 8px 48px rgba(100, 70, 200, 0.14), 0 2px 12px rgba(100,70,200,0.07);
          padding: 44px 48px 40px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          position: relative;
          animation: fadeUp 0.4s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .se-title {
          font-size: 26px;
          font-weight: 800;
          color: #2d1f5e;
          margin: 0 0 10px;
          letter-spacing: -0.4px;
        }
        .se-subtitle {
          font-size: 15px;
          color: #6b5eaa;
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .se-avatar-wrap {
          position: relative;
          display: inline-block;
          margin-bottom: 18px;
        }
        .se-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(124,77,219,.22);
          display: block;
          background: linear-gradient(135deg, #c4b5f0, #7c4ddb);
        }
        .se-avatar-initials {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c4b5f0, #7c4ddb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: 700;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(124,77,219,.22);
        }
        .se-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          box-shadow: 0 2px 6px rgba(0,0,0,.12);
        }
        .se-doctor-name {
          font-size: 18px;
          font-weight: 700;
          color: #2d1f5e;
          margin: 0 0 4px;
        }
        .se-duration {
          font-size: 14px;
          color: #7c6aaa;
          margin: 0 0 32px;
        }
        .se-divider {
          width: 100%;
          height: 1px;
          background: #f0ebff;
          margin: 0 0 28px;
        }
        /* ── Star rating ── */
        .se-stars {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        .se-star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          transition: transform .12s;
          line-height: 0;
        }
        .se-star-btn:hover { transform: scale(1.2); }
        .se-rating-hint {
          font-size: 12px;
          color: #9889c8;
          margin-bottom: 28px;
          min-height: 18px;
        }
        /* ── Action buttons ── */
        .se-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-rate {
          background: linear-gradient(135deg, #6b3fd4, #4a26a0);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 11px 22px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: inherit;
          box-shadow: 0 4px 14px rgba(107,63,212,.32);
          transition: opacity .15s, transform .1s;
          white-space: nowrap;
        }
        .btn-rate:hover { opacity: .9; transform: translateY(-1px); }
        .btn-outline {
          background: white;
          color: #3d2e70;
          border: 1.5px solid #ddd6f8;
          border-radius: 12px;
          padding: 11px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background .15s, border-color .15s;
          white-space: nowrap;
        }
        .btn-outline:hover { background: #f7f4ff; border-color: #c4b0f0; }
        /* ── Feedback box ── */
        .se-feedback-box {
          margin-top: 24px;
          text-align: left;
          animation: fadeUp .25s ease;
        }
        .se-feedback-label {
          font-size: 13px;
          font-weight: 600;
          color: #4a3680;
          margin-bottom: 8px;
          display: block;
        }
        .se-feedback-textarea {
          width: 100%;
          border: 1.5px solid #ddd6f8;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          font-family: inherit;
          color: #2d1f5e;
          resize: vertical;
          outline: none;
          min-height: 90px;
          box-sizing: border-box;
          transition: border-color .15s;
        }
        .se-feedback-textarea:focus { border-color: #a78bfa; }
        .se-feedback-submit {
          margin-top: 10px;
          background: linear-gradient(135deg, #6b3fd4, #4a26a0);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: opacity .15s;
        }
        .se-feedback-submit:hover { opacity: .88; }
        .se-submitted {
          margin-top: 16px;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          color: #166534;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeUp .2s ease;
        }
        @media (max-width: 500px) {
          .se-card { padding: 32px 20px 28px; }
          .se-title { font-size: 22px; }
          .se-actions { flex-direction: column; align-items: stretch; }
          .btn-rate, .btn-outline { justify-content: center; }
        }
      `}</style>

      <div className="se-root">
        <div className="se-card">
          {/* Title */}
          <h1 className="se-title">Session Ended</h1>
          <p className="se-subtitle">Your session with Dr. Sarah Mitchell has ended.</p>

          {/* Doctor avatar */}
          <div className="se-avatar-wrap">
            <div className="se-avatar-initials">SM</div>
            <div className="se-badge">
              <CheckBadge size={22} />
            </div>
          </div>

          {/* Doctor info */}
          <div className="se-doctor-name">Dr. Sarah Mitchell, <span style={{ fontWeight: 400, fontSize: 16 }}>PhD</span></div>
          <div className="se-duration">Duration: {duration} mins</div>

          <div className="se-divider" />

          {/* Star rating */}
          <div className="se-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className="se-star-btn"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <StarIcon size={28} filled={(hovered || rating) >= star} />
              </button>
            ))}
          </div>
          <div className="se-rating-hint">
            {rating === 1 && "Poor — we're sorry to hear that."}
            {rating === 2 && "Fair — we'll work to improve."}
            {rating === 3 && "Good — thanks for the feedback!"}
            {rating === 4 && "Very good — glad you had a positive experience!"}
            {rating === 5 && "Excellent — so happy to hear that! 🎉"}
            {rating === 0 && hovered > 0 && `Rate ${hovered} star${hovered > 1 ? "s" : ""}`}
          </div>

          {/* Action buttons */}
          <div className="se-actions">
            <button className="btn-rate" onClick={() => handleRate(rating || 5)}>
              <StarIcon size={15} filled /> Rate
            </button>
            <button className="btn-outline" onClick={() => setShowFeedback(v => !v)}>
              Leave feedback
            </button>
            <button className="btn-outline" onClick={onBookAgain}>
              <CalendarIcon size={15} /> Book again
            </button>
            <button className="btn-outline" onClick={onDone}>
              Done
            </button>
          </div>

          {/* Feedback box */}
          {showFeedback && !submitted && (
            <div className="se-feedback-box">
              <label className="se-feedback-label">Share your thoughts about this session</label>
              <textarea
                className="se-feedback-textarea"
                placeholder="What went well? What could be improved?"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <button className="se-feedback-submit" onClick={handleFeedbackSubmit}>
                Submit Feedback
              </button>
            </div>
          )}

          {submitted && (
            <div className="se-submitted">
              ✅ Thank you! Your feedback has been submitted.
            </div>
          )}
        </div>
      </div>
    </>
  );
}