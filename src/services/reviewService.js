import api from './api';

export const submitReview = (payload) =>
  api.post('/reviews', payload).then(r => r.data);

export const getReviews = (restaurantId, page = 0) =>
  api.get(`/reviews/${restaurantId}`, { params: { page } }).then(r => r.data);

export const getKeywordSuggestions = (orderId) =>
  api.get('/reviews/suggestions', { params: { orderId } }).then(r => r.data.keywords);