const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Use Claude to suggest review keywords based on what was ordered.
 *
 * @param {string} itemNames - Comma-separated list of ordered item names
 *                             e.g. "Butter Chicken, Garlic Naan, Mango Lassi"
 * @returns {Promise<string[]>} Array of 5 keyword suggestions
 */
async function suggestKeywords(itemNames) {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // fast and cheap for this task
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content:
            `Suggest exactly 5 specific food review keywords for someone who ordered: ${itemNames}. ` +
            `Reply with only a JSON array of strings. No explanation. Example: ["crispy","spicy","generous portions","fresh","aromatic"]`
        }
      ]
    });

    const raw = message.content[0]?.text?.trim() || '[]';

    // Strip any markdown fences if the model wraps in ```json
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) return getFallbackKeywords();
    return parsed.slice(0, 5); // enforce max 5
  } catch (err) {
    console.error('suggestKeywords error:', err.message);
    // Return safe fallback so the review page still works
    return getFallbackKeywords();
  }
}

/**
 * Fallback keywords when AI is unavailable or API key is not set.
 */
function getFallbackKeywords() {
  return ['fresh', 'flavourful', 'generous portions', 'well-packed', 'hot on arrival'];
}

module.exports = { suggestKeywords };