// Practical 12: automated API tests that run in CI.
// No real database is needed: the Task model is mocked, and the other
// routes under test stop (401 / 400 / 404) before they reach MongoDB.

// server.js stops at start-up if JWT_SECRET is missing, so set it BEFORE loading the app.
process.env.JWT_SECRET = 'test-secret-for-ci';

jest.mock('../models/Task', () => ({ find: jest.fn(), create: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const app = require('../server');

const USER_ID = '64b7f0c2a1b2c3d4e5f60718';
const token = jwt.sign({ id: USER_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Task Management API', () => {
  test('GET /tasks without a token returns 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Authentication required/);
  });

  test('GET /tasks with a valid token returns 200 and a list', async () => {
    const sample = [{ _id: 't1', title: 'Write report', priority: 'high' }];
    Task.find.mockReturnValue({ sort: () => ({ lean: () => Promise.resolve(sample) }) });

    const res = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(sample);
  });

  test('POST /auth/register with an invalid email returns 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'secret123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  test('GET /tasks/:id with a malformed id returns 400', async () => {
    const res = await request(app).get('/tasks/abc').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });

  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});