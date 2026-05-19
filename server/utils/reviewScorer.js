function scoreReview(text, mediaUrl, keywords = []) {
  let score = 0;

  // Word count scoring
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 20) score += 10;
  if (wordCount >= 50) score += 20;
  if (wordCount >= 100) score += 30;

  // Bonus for including a photo
  if (mediaUrl) score += 20;

  // Bonus for each keyword selected (max 4 keywords counted)
  const keywordBonus = Math.min(keywords.length, 4) * 5;
  score += keywordBonus;

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Calculate how many loyalty points a review earns.
 * @param {number} score - Review score (0–100)
 * @returns {number} loyalty points to award
 */
function calculatePoints(score) {
  return Math.floor(score / 2);
}

module.exports = { scoreReview, calculatePoints };
