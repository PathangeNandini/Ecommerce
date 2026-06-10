import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Review.css";

const STARS = [1, 2, 3, 4, 5];

export default function Review() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [points, setPoints] = useState(0);

  // Load existing reviews and keyword suggestions
  useEffect(() => {
    api.get(`/reviews/${restaurantId}`).then(({ data }) => setReviews(data));
    api.get(`/reviews/keywords/${restaurantId}`).then(({ data }) => setKeywords(data.keywords || []));
  }, [restaurantId]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const meaningfulWords = text.split(/\s+/).filter((w) => w.length >= 5).length;

  const getPointsPreview = () => {
    let p = 10;
    if (meaningfulWords >= 20) p += 20;
    else if (meaningfulWords >= 10) p += 10;
    else if (meaningfulWords >= 5) p += 5;
    if (rating === 5) p += 5;
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
      const { data } = await api.post("/reviews", {
        restaurantId,
        rating,
        text,
      });

      setPoints(data.pointsAwarded);
      setSuccess(data.message);
      setRating(0);
      setText("");

      // Reload reviews
      const updated = await api.get(`/reviews/${restaurantId}`);
      setReviews(updated.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-page">
      <div className="review-container">
        <h2>Rate & Review</h2>

        {/* Star Rating */}
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

        {/* Keyword suggestions */}
        {keywords.length > 0 && (
          <div className="keywords-section">
            <p className="keywords-label">💡 Popular keywords — tap to add:</p>
            <div className="keywords-list">
              {keywords.map((kw) => (
                <button key={kw} className="keyword-chip" onClick={() => handleKeyword(kw)}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review text */}
        <textarea
          className="review-textarea"
          placeholder="Share your experience... (min 10 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />

        {/* Word count + points preview */}
        <div className="review-meta">
          <span>{wordCount} words</span>
          <span className="points-preview">🏆 You'll earn ~{getPointsPreview()} points</span>
        </div>

        {error && <p className="review-error">{error}</p>}

        {success && (
          <div className="review-success">
            <p>✅ {success}</p>
            <p className="points-awarded">+{points} reward points added to your account!</p>
          </div>
        )}

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
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