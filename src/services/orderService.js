import api from './api';

export const placeOrder = (payload) =>
  api.post('/orders', payload).then(r => r.data);

export const getOrderById = (id) =>
  api.get(`/orders/${id}`).then(r => r.data);

export const getMyOrders = () =>
  api.get('/orders/my').then(r => r.data);