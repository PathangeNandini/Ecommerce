import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Review.css";

const STARS = [1, 2, 3, 4, 5];

export default function Review() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating]     = useState(0);
  const [hover, setHover]       = useState(0);
  const [text, setText]         = useState("");
  const [keywords, setKeywords] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [photo, setPhoto]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState("");
  const [points, setPoints]     = useState(0);

  useEffect(() => {
    api.get(`/reviews/${restaurantId}`).then(({ data }) => setReviews(data));
    api.get(`/reviews/my-keywords/${restaurantId}`)
      .then(({ data }) => setKeywords(data.keywords || []))
      .catch(() => {
        api.get(`/reviews/keywords/${restaurantId}`)
          .then(({ data }) => setKeywords(data.keywords || []));
      });
  }, [restaurantId]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const meaningfulWords = text.split(/\s+/).filter((w) => w.length >= 5).length;

  const getPointsPreview = () => {
    let p = 10;
    if (meaningfulWords >= 20) p += 20;
    else if (meaningfulWords >= 10) p += 10;
    else if (meaningfulWords >= 5) p += 5;
    if (rating === 5) p += 5;
    if (photo) p += 15;
    return p;
  };

  const handleKeyword = (kw) => {
    setText((prev) => prev ? `${prev} ${kw}` : kw);
  };

  const handleSubmit = async () => {
    if (!rating) return setError("Please select a rating");
    if (text.trim().length < 10) return setError("Review must be at least 10 characters");

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("restaurantId", restaurantId);
      formData.append("rating", rating);
      formData.append("text", text);
      if (photo) formData.append("photo", photo);

      const { data } = await api.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPoints(data.pointsAwarded);
      setSuccess(data.message);
      setRating(0);
      setText("");
      setPhoto(null);
      setPreview(null);

      const updated = await api.get(`/reviews/${restaurantId}`);
      setReviews(updated.data);

      // ✅ FIX: Redirect to home after 2 seconds on success
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-page">
      <div className="review-container">
        <div className="review-top-bar">
          <button className="review-back" onClick={() => navigate(-1)}>← Back</button>
          <h2>Rate & Review</h2>
        </div>

        {/* Star Rating */}
        <div className="star-section">
          <p className="section-label">⭐ Select Your Rating</p>
          <div className="star-row">
            {STARS.map((s) => (
              <span
                key={s}
                className={`star ${s <= (hover || rating) ? "filled" : ""}`}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
            {rating > 0 && (
              <span className="rating-label">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Keyword suggestions */}
        {keywords.length > 0 && (
          <div className="keywords-section">
            <p className="keywords-label">💡 Suggested keywords — tap to add:</p>
            <div className="keywords-list">
              {keywords.map((kw) => (
                <button key={kw} className="keyword-chip" onClick={() => handleKeyword(kw)}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review textarea */}
        <div className="textarea-section">
          <p className="section-label">✏️ Your Review</p>
          <textarea
            className="review-textarea"
            placeholder="Share your experience... (min 10 characters)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          />
        </div>

        {/* Word count + points preview */}
        <div className="review-meta">
          <span>{wordCount} words</span>
          <span className="points-preview">🏆 You'll earn ~{getPointsPreview()} points</span>
        </div>

        {/* Photo upload */}
        <div className="photo-upload-section">
          <label className="photo-upload-label">
            📷 Add a photo <span className="photo-bonus">+15 points</span>
            <input
              type="file"
              accept="image/*"
              className="photo-input"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPhoto(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
          {preview && (
            <div className="photo-preview-wrap">
              <img src={preview} alt="preview" className="photo-preview" />
              <button
                className="photo-remove"
                onClick={() => { setPhoto(null); setPreview(null); }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="review-error">{error}</p>}

        {success && (
          <div className="review-success">
            <p>✅ {success}</p>
            <p className="points-awarded">+{points} reward points! Redirecting home...</p>
          </div>
        )}

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !!success}
        >
          {loading ? "Submitting..." : success ? "✅ Submitted!" : `Submit Review · Earn ${getPointsPreview()} pts`}
        </button>

        {/* Existing reviews */}
        {reviews.length > 0 && (
          <div className="reviews-list">
            <h3>What others say</h3>
            {reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{r.userId?.name || "Anonymous"}</span>
                  <span className="review-stars">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="review-text">{r.text}</p>
                {r.photoUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${r.photoUrl}`}
                    alt="review"
                    className="review-photo"
                  />
                )}
                <span className="review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}