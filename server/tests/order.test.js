const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

let consumerToken, restaurantToken, testRestaurant, testMenuItem;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);

  // Create consumer
  const consumerRes = await request(app).post('/api/auth/register').send({
    name: 'Test Consumer', email: 'consumer.order@test.com', password: 'pass123', role: 'consumer'
  });
  consumerToken = consumerRes.body.token;

  // Create restaurant owner
  const restaurantRes = await request(app).post('/api/auth/register').send({
    name: 'Test Owner', email: 'owner.order@test.com', password: 'pass123', role: 'restaurant'
  });
  restaurantToken = restaurantRes.body.token;
  const ownerId = restaurantRes.body.user.id;

  // Create test restaurant
  testRestaurant = await Restaurant.create({
    name: 'Test Restaurant',
    cuisine: 'South Indian',
    rating: 4.0,
    address: 'Test Address',
    location: { type: 'Point', coordinates: [80.2127, 13.0100] },
    ownerId
  });

  // Create test menu item
  testMenuItem = await MenuItem.create({
    restaurantId: testRestaurant._id,
    name: 'Test Idli',
    price: 40,
    category: 'Breakfast',
    available: true
  });
});

afterAll(async () => {
  await Order.deleteMany({});
  await MenuItem.deleteMany({ name: 'Test Idli' });
  await Restaurant.deleteMany({ name: 'Test Restaurant' });
  await User.deleteMany({ email: /\.order@test\.com$/ });
  await mongoose.connection.close();
});

describe('POST /api/orders', () => {
  it('should place an order successfully', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        restaurantId: testRestaurant._id,
        items: [{ menuItemId: testMenuItem._id, qty: 2 }],
        deliveryAddress: '123 Test Street'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('placed');
    expect(res.body.totalPrice).toBe(80); // 40 * 2 = server-calculated
  });

  it('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ restaurantId: testRestaurant._id, items: [] });

    expect(res.statusCode).toBe(401);
  });

  it('should return 400 for empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ restaurantId: testRestaurant._id, items: [] });

    expect(res.statusCode).toBe(400);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  let orderId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        restaurantId: testRestaurant._id,
        items: [{ menuItemId: testMenuItem._id, qty: 1 }]
      });
    orderId = res.body._id;
  });

  it('should update order status (restaurant role)', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({ status: 'preparing' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('preparing');
  });

  it('should reject invalid status', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${restaurantToken}`)
      .send({ status: 'flying' });

    expect(res.statusCode).toBe(400);
  });

  it('should reject consumer updating status', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({ status: 'preparing' });

    expect(res.statusCode).toBe(403);
  });
});

