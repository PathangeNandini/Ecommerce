// server/utils/nlpHelper.js
// Keyword suggestions based on order items — no external API needed

const Order = require('../models/Order');

const keywordBank = {
  biryani:      ['aromatic', 'flavourful', 'well-spiced', 'tender meat', 'perfect rice'],
  chicken:      ['juicy', 'well-cooked', 'tender', 'spicy', 'finger-licking'],
  mutton:       ['tender', 'rich gravy', 'well-marinated', 'flavourful', 'slow-cooked'],
  pizza:        ['crispy crust', 'cheesy', 'generous toppings', 'well-baked', 'tasty sauce'],
  dosa:         ['crispy', 'golden', 'thin', 'well-fermented', 'served hot'],
  idli:         ['soft', 'fluffy', 'fresh', 'light', 'good chutney'],
  vada:         ['crispy outside', 'soft inside', 'hot', 'fresh', 'well-fried'],
  coffee:       ['strong', 'aromatic', 'perfect blend', 'hot', 'refreshing'],
  default:      ['fresh', 'tasty', 'good portion', 'value for money', 'would recommend']
};

const suggestKeywords = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return keywordBank.default;

    const itemNames = order.items.map(i => i.name.toLowerCase()).join(' ');

    for (const [key, keywords] of Object.entries(keywordBank)) {
      if (key !== 'default' && itemNames.includes(key)) {
        return keywords;
      }
    }

    return keywordBank.default;
  } catch (err) {
    return keywordBank.default;
  }
};

module.exports = { suggestKeywords };