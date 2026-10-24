'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { TaskService } = require('../src/services/taskService');

describe('Tasks API', () => {
  let app;

  beforeEach(() => {
    app = createApp(new TaskService());
  });

  test('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Deploy to Ubuntu', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: 'Deploy to Ubuntu', priority: 'high' });
  });

  test('POST /api/tasks validates input', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST with malformed JSON returns 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid JSON body');
  });

  test('GET /api/tasks lists and filters', async () => {
    await request(app).post('/api/tasks').send({ title: 'One', priority: 'low' });
    await request(app).post('/api/tasks').send({ title: 'Two', priority: 'high' });
    await request(app).put('/api/tasks/2').send({ completed: true });

    const all = await request(app).get('/api/tasks');
    expect(all.body).toHaveLength(2);

    const done = await request(app).get('/api/tasks?completed=true');
    expect(done.body).toHaveLength(1);
    expect(done.body[0].title).toBe('Two');

    const pending = await request(app).get('/api/tasks?completed=false');
    expect(pending.body).toHaveLength(1);

    const search = await request(app).get('/api/tasks?search=one');
    expect(search.body).toHaveLength(1);
  });

  test('GET /api/tasks/:id returns a task or 404', async () => {
    await request(app).post('/api/tasks').send({ title: 'One' });

    const ok = await request(app).get('/api/tasks/1');
    expect(ok.status).toBe(200);

    const missing = await request(app).get('/api/tasks/42');
    expect(missing.status).toBe(404);
  });

  test('GET /api/tasks/:id rejects non-numeric id', async () => {
    const res = await request(app).get('/api/tasks/abc');
    expect(res.status).toBe(400);
  });

  test('PUT /api/tasks/:id updates a task', async () => {
    await request(app).post('/api/tasks').send({ title: 'Old' });
    const res = await request(app)
      .put('/api/tasks/1')
      .send({ title: 'New', completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'New', completed: true });
  });

  test('PUT returns 404 for missing task and 400 for bad data', async () => {
    const missing = await request(app).put('/api/tasks/9').send({ title: 'x' });
    expect(missing.status).toBe(404);

    await request(app).post('/api/tasks').send({ title: 'A' });
    const bad = await request(app).put('/api/tasks/1').send({ priority: 'nope' });
    expect(bad.status).toBe(400);
  });

  test('DELETE /api/tasks/:id removes a task', async () => {
    await request(app).post('/api/tasks').send({ title: 'A' });

    const del = await request(app).delete('/api/tasks/1');
    expect(del.status).toBe(204);

    const again = await request(app).delete('/api/tasks/1');
    expect(again.status).toBe(404);
  });

  test('GET /api/tasks/stats returns summary', async () => {
    await request(app).post('/api/tasks').send({ title: 'A' });
    await request(app).post('/api/tasks').send({ title: 'B' });
    await request(app).put('/api/tasks/1').send({ completed: true });

    const res = await request(app).get('/api/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, completed: 1, pending: 1, completionRate: 50 });
  });
});
