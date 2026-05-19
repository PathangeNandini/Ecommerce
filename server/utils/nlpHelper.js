const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * nlpHelper.js
 * 
 * Uses the Claude API to suggest relevant food review keywords
 * based on what the user ordered.
 * 
 * Example:
 *   input:  "Butter Chicken, Garlic Naan, Mango Lassi"
 *   output: ["creamy", "aromatic", "well-spiced", "fresh bread", "refreshing"]
 */

/**
 * Get AI-suggested keywords for a review based on ordered items.
 * @param {string} orderedItems - Comma-separated list of ordered item names
 * @returns {Promise<string[]>} array of 5 keyword suggestions
 */
async function suggestKeywords(orderedItems) {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Suggest exactly 5 specific, useful food review keywords for someone who ordered: ${orderedItems}.
          
Return ONLY a JSON array of 5 strings, nothing else. Example format: ["crispy", "well-seasoned", "generous portion", "fresh ingredients", "aromatic"]

The keywords should be descriptive adjectives or short phrases a reviewer would actually use.`
        }
      ]
    });

    const responseText = message.content[0].text.trim();

    // Parse the JSON array from the response
    const keywords = JSON.parse(responseText);

    if (!Array.isArray(keywords)) {
      throw new Error('Response was not an array');
    }

    return keywords.slice(0, 5); // Ensure max 5
  } catch (err) {
    console.error('Claude API error:', err.message);
    // Return fallback keywords if API fails
    return ['delicious', 'fresh', 'well-portioned', 'flavorful', 'good value'];
  }
}

module.exports = { suggestKeywords };
