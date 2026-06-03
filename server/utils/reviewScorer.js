/**
 * reviewScorer.js
 * Scores a review based on length, photo, and keyword usage.
 * Also calculates loyalty points to award.
 */

/**
 * Score a review out of 100.
 * @param {string} text      - Review text written by the user
 * @param {string} mediaUrl  - Optional photo URL
 * @param {string[]} keywords - Keywords the user selected (AI-suggested chips)
 * @returns {number} score 0–100
 */
function scoreReview(text = '', mediaUrl = null, keywords = []) {
  let score = 0;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Word count tiers (additive)
  if (wordCount >= 20) score += 10;
  if (wordCount >= 50) score += 20;
  if (wordCount >= 100) score += 30;

  // Bonus for attaching a photo
  if (mediaUrl) score += 20;

  // 5 points per keyword selected (AI-suggested chips)
  score += (keywords.length || 0) * 5;

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Convert a review score into loyalty points.
 * Formula: points = score / 2  (max 50 points per review)
 * @param {number} score
 * @returns {number} loyalty points to award
 */
function calculatePoints(score) {
  return Math.floor(score / 2);
}

module.exports = { scoreReview, calculatePoints };