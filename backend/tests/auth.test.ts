import request from 'supertest';
import app from './app';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('Auth — Register', () => {
  it('registers a new adopter successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'pass123',
      role: 'adopter',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('adopter');
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects password shorter than 6 chars', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: '123',
      role: 'adopter',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'User A', email: 'dupe@example.com', password: 'pass123', role: 'adopter',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'User B', email: 'dupe@example.com', password: 'pass123', role: 'adopter',
    });
    expect(res.status).toBe(400);
  });

  it('defaults unknown role to adopter', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin Try', email: 'tryadmin@example.com', password: 'pass123', role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('adopter');
  });

  it('registers as donor', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Donor User', email: 'donor@example.com', password: 'pass123', role: 'donor',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('donor');
  });

  it('registers as shelter', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Shelter Org', email: 'shelter@example.com', password: 'pass123', role: 'shelter',
      shelterRegistrationNumber: 'TN-001',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('shelter');
  });
});

describe('Auth — Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User', email: 'login@example.com', password: 'pass123', role: 'adopter',
    });
  });

  it('logs in with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'pass123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com', password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });

  it('rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com', password: 'pass123',
    });
    expect(res.status).toBe(401);
  });
});

describe('Auth — Get Me', () => {
  let token: string;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Me User', email: 'me@example.com', password: 'pass123', role: 'adopter',
    });
    token = res.body.data.token;
  });

  it('returns current user with valid token', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@example.com');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Auth — Password Reset', () => {
  let userEmail = 'reset@example.com';

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Reset User', email: userEmail, password: 'oldpass123', role: 'adopter',
    });
  });

  it('forgot-password returns success even for unknown email (no enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'unknown@example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('forgot-password returns reset token in dev mode', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: userEmail,
    });
    expect(res.status).toBe(200);
    expect(res.body.devMode).toBe(true);
    expect(res.body.resetToken).toBeDefined();
  });

  it('resets password with valid token', async () => {
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: userEmail });
    const { resetToken } = forgotRes.body;

    const resetRes = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, newPassword: 'newpass123',
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Can now login with new password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userEmail, password: 'newpass123',
    });
    expect(loginRes.status).toBe(200);
  });

  it('rejects reset with invalid token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'invalidtoken', newPassword: 'newpass123',
    });
    expect(res.status).toBe(400);
  });

  it('rejects new password shorter than 6 chars', async () => {
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: userEmail });
    const { resetToken } = forgotRes.body;

    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken, newPassword: '123',
    });
    expect(res.status).toBe(400);
  });

  it('requires email for forgot-password', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
  });
});
