import request from 'supertest';
import app from './app';
import { connectTestDB, disconnectTestDB, clearTestDB } from './setup';

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => { await clearTestDB(); });

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function registerAndLogin(email: string, role = 'donor') {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User', email, password: 'pass123', role,
  });
  return res.body.data.token as string;
}

const dogPayload = {
  name: 'Bruno',
  breed: 'Indian Pariah',
  age: 2,
  location: 'Chennai',
  description: 'A friendly and energetic dog looking for a loving home.',
  vaccinated: true,
  healthStatus: 'Healthy',
  gender: 'Male',
  size: 'Medium',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Dogs — Browse (public)', () => {
  it('returns empty list when no dogs', async () => {
    const res = await request(app).get('/api/dogs-v2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns dogs after creation', async () => {
    const token = await registerAndLogin('donor1@test.com', 'donor');
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`).send(dogPayload);
    const res = await request(app).get('/api/dogs-v2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('filters by vaccinated=true', async () => {
    const token = await registerAndLogin('donor2@test.com', 'donor');
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`)
      .send({ ...dogPayload, vaccinated: true });
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`)
      .send({ ...dogPayload, name: 'Shiro', vaccinated: false });

    const res = await request(app).get('/api/dogs-v2?vaccinated=true');
    expect(res.status).toBe(200);
    res.body.data.forEach((d: any) => expect(d.vaccinated).toBe(true));
  });

  it('searches by name', async () => {
    const token = await registerAndLogin('donor3@test.com', 'donor');
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`).send(dogPayload);
    const res = await request(app).get('/api/dogs-v2?search=Bruno');
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Bruno');
  });
});

describe('Dogs — Create', () => {
  it('donor can create a listing', async () => {
    const token = await registerAndLogin('donor4@test.com', 'donor');
    const res = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send(dogPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Bruno');
  });

  it('rejects creation without auth', async () => {
    const res = await request(app).post('/api/dogs-v2').send(dogPayload);
    expect(res.status).toBe(401);
  });

  it('rejects missing required fields', async () => {
    const token = await registerAndLogin('donor5@test.com', 'donor');
    const res = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send({ name: 'Incomplete' });
    expect(res.status).toBe(400);
  });
});

describe('Dogs — Get by ID', () => {
  it('returns dog by valid ID', async () => {
    const token = await registerAndLogin('donor6@test.com', 'donor');
    const created = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send(dogPayload);
    const dogId = created.body.data._id;

    const res = await request(app).get(`/api/dogs-v2/${dogId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(dogId);
  });

  it('returns 404 for non-existent ID', async () => {
    const res = await request(app).get('/api/dogs-v2/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});

describe('Dogs — Update', () => {
  let token: string;
  let dogId: string;

  beforeEach(async () => {
    token = await registerAndLogin('donor7@test.com', 'donor');
    const res = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send(dogPayload);
    dogId = res.body.data._id;
  });

  it('owner can update their dog', async () => {
    const res = await request(app).put(`/api/dogs-v2/${dogId}`)
      .set('Authorization', `Bearer ${token}`).send({ name: 'Bruno Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Bruno Updated');
  });

  it('another user cannot update', async () => {
    const otherToken = await registerAndLogin('other7@test.com', 'donor');
    const res = await request(app).put(`/api/dogs-v2/${dogId}`)
      .set('Authorization', `Bearer ${otherToken}`).send({ name: 'Hijacked' });
    expect(res.status).toBe(403);
  });

  it('unauthenticated update is rejected', async () => {
    const res = await request(app).put(`/api/dogs-v2/${dogId}`).send({ name: 'Fail' });
    expect(res.status).toBe(401);
  });
});

describe('Dogs — Delete', () => {
  let token: string;
  let dogId: string;

  beforeEach(async () => {
    token = await registerAndLogin('donor8@test.com', 'donor');
    const res = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send(dogPayload);
    dogId = res.body.data._id;
  });

  it('owner can delete their dog', async () => {
    const res = await request(app).delete(`/api/dogs-v2/${dogId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('another user cannot delete', async () => {
    const otherToken = await registerAndLogin('other8@test.com', 'donor');
    const res = await request(app).delete(`/api/dogs-v2/${dogId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Dogs — Toggle Adopted', () => {
  let token: string;
  let dogId: string;

  beforeEach(async () => {
    token = await registerAndLogin('donor9@test.com', 'donor');
    const res = await request(app).post('/api/dogs-v2')
      .set('Authorization', `Bearer ${token}`).send(dogPayload);
    dogId = res.body.data._id;
  });

  it('owner can mark dog as adopted', async () => {
    const res = await request(app).patch(`/api/dogs-v2/${dogId}/adopted`)
      .set('Authorization', `Bearer ${token}`).send({ adopted: true });
    expect(res.status).toBe(200);
    expect(res.body.data.adopted).toBe(true);
  });

  it('rejects non-boolean adopted value', async () => {
    const res = await request(app).patch(`/api/dogs-v2/${dogId}/adopted`)
      .set('Authorization', `Bearer ${token}`).send({ adopted: 'yes' });
    expect(res.status).toBe(400);
  });
});

describe('Dogs — My Listings', () => {
  it('returns only the authenticated user's listings', async () => {
    const token = await registerAndLogin('donor10@test.com', 'donor');
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`).send(dogPayload);
    await request(app).post('/api/dogs-v2').set('Authorization', `Bearer ${token}`)
      .send({ ...dogPayload, name: 'Buddy' });

    const res = await request(app).get('/api/dogs-v2/my-listings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/dogs-v2/my-listings');
    expect(res.status).toBe(401);
  });
});

describe('Dogs — Stats', () => {
  it('returns platform statistics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('available');
    expect(res.body.data).toHaveProperty('adopted');
    expect(res.body.data).toHaveProperty('adopters');
  });
});
