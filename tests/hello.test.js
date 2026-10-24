'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');

describe('Hello routes', () => {
  const app = createApp();

  test('GET /hello returns hello message', async () => {
    const res = await request(app).get('/hello');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello from Mayuresh Dandekar!');
  });

  test('GET /bye returns bye message', async () => {
    const res = await request(app).get('/bye');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Bye Bye!');
  });

  test('GET /hi returns hi message', async () => {
    const res = await request(app).get('/hi');
    expect(res.status).toBe(200);
    expect(res.text).toBe('I am saying Hi!');
  });

  test('GET /health reports UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  test('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Route not found/);
  });
});
