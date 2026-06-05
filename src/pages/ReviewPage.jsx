import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ReviewPage.css";

function scoreReview(text, mediaUrl, keywords) {
  let score = 0;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  if (wordCount >= 20) score += 10;
  if (wordCount >= 50) score += 20;
  if (wordCount >= 100) score += 30;
  if (mediaUrl) score += 20;
  score += keywords.length * 5;
  return Math.min(score, 100);
}

export default function ReviewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [loadingKw, setLoadingKw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [error, setError] = useState("");

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const score = scoreReview(text, mediaUrl, selectedKeywords);

  const fetchSuggestions = async () => {
    setLoadingKw(true);
    try {
      const { data } = await api.get(`/reviews/suggestions?orderId=${orderId}`);
      setSuggestedKeywords(data.keywords || []);
    } catch {
      setSuggestedKeywords(["tasty", "fresh", "quick delivery", "great value", "would order again"]);
    } finally {
      setLoadingKw(false);
    }
  };

  const toggleKeyword = (kw) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  const handleSubmit = async () => {
    if (text.trim().length < 10) { setError("Please write at least a few words."); return; }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/reviews", {
        orderId,
        text,
        mediaUrl: mediaUrl || undefined,
        keywords: selectedKeywords,
      });
      setEarnedPoints(data.pointsEarned);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="review-page">
        <div className="review-success">
          <div className="success-confetti">🎉</div>
          <h1>Review submitted!</h1>
          <p>You earned</p>
          <div className="points-earned">+{earnedPoints} points</div>
          <p className="success-sub">Keep reviewing to unlock more rewards!</p>
          <button onClick={() => navigate("/profile")} className="go-profile-btn">
            View My Points
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <div className="review-header">
        <button className="rev-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>Write a Review</h1>
      </div>

      <div className="review-body">
        {/* Score preview */}
        <div className="score-card">
          <div className="score-ring">
            <svg viewBox="0 0 80 80" className="score-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#2a2a2a" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="#e8450a"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <div className="score-number">{score}</div>
          </div>
          <div className="score-info">
            <p className="score-label">Review Score</p>
            <p className="score-points">You'll earn <strong>{Math.floor(score / 2)} points</strong></p>
            <div className="score-hints">
              <span className={wordCount >= 20 ? "hint done" : "hint"}>20+ words +10</span>
              <span className={wordCount >= 50 ? "hint done" : "hint"}>50+ words +20</span>
              <span className={wordCount >= 100 ? "hint done" : "hint"}>100+ words +30</span>
              <span className={mediaUrl ? "hint done" : "hint"}>Photo +20</span>
              <span className={selectedKeywords.length > 0 ? "hint done" : "hint"}>Keywords +5 each</span>
            </div>
          </div>
        </div>

        {/* Text area */}
        <div className="review-section">
          <label className="rev-label">
            Your review
            <span className="word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
          </label>
          <textarea
            className="rev-textarea"
            placeholder="How was the food? Was it fresh, hot, tasty? Tell us everything…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
        </div>

        {/* Photo URL */}
        <div className="review-section">
          <label className="rev-label">Photo URL (optional) <span className="bonus-tag">+20 pts</span></label>
          <input
            className="rev-input"
            type="url"
            placeholder="https://your-photo-url.jpg"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>

        {/* Keywords */}
        <div className="review-section">
          <div className="kw-label-row">
            <label className="rev-label">Keywords <span className="bonus-tag">+5 pts each</span></label>
            <button className="suggest-btn" onClick={fetchSuggestions} disabled={loadingKw}>
              {loadingKw ? "Loading…" : "✨ Suggest keywords"}
            </button>
          </div>

          {suggestedKeywords.length > 0 && (
            <div className="kw-chips">
              {suggestedKeywords.map((kw) => (
                <button
                  key={kw}
                  className={`kw-chip ${selectedKeywords.includes(kw) ? "selected" : ""}`}
                  onClick={() => toggleKeyword(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div className="rev-error">{error}</div>}

        <button
          className="submit-review-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : `Submit Review · Earn ${Math.floor(score / 2)} pts`}
        </button>
      </div>
    </div>
  );
}
