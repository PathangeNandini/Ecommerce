const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');

// Use a separate test database
const TEST_DB = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean up users before each test
  await User.deleteMany({ email: /test\.com$/ });
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@test.com',
        password: 'password123',
        role: 'consumer'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.role).toBe('consumer');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should reject duplicate email registration', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User A', email: 'dup@test.com', password: 'password123' });

    // Duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: 'dup@test.com', password: 'password456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toMatch(/email/i);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create a test user to log in with
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login Test', email: 'logintest@test.com', password: 'correct123' });
  });

  it('should login with correct credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logintest@test.com', password: 'correct123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('logintest@test.com');
  });

  it('should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logintest@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  it('should return user profile with valid JWT', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me User', email: 'meuser@test.com', password: 'password123' });

    const token = registerRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('meuser@test.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
