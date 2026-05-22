import api from './api';

export const getNearbyRestaurants = async ({ lat, lng, radius = 5, cuisine, minRating, page = 0 }) => {
  const { data } = await api.get('/restaurants/nearby', {
    params: { lat, lng, radius, cuisine, minRating, page }
  });
  return data.results || data; // handles both { results: [] } and plain array
};

export const getRestaurantById = async (id) => {
  const { data } = await api.get(`/restaurants/${id}`);
  return data; // { restaurant, menu, menuItems }
};