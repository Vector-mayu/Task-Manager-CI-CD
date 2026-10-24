'use strict';

const { TaskService } = require('../src/services/taskService');

describe('TaskService', () => {
  let service;

  beforeEach(() => {
    service = new TaskService();
  });

  test('creates a task with defaults', () => {
    const { task } = service.create({ title: '  Learn CI/CD  ' });
    expect(task).toMatchObject({
      id: 1,
      title: 'Learn CI/CD',
      priority: 'medium',
      completed: false,
    });
  });

  test('rejects empty title', () => {
    const { errors } = service.create({ title: '   ' });
    expect(errors).toHaveLength(1);
  });

  test('rejects title longer than 100 chars', () => {
    const { errors } = service.create({ title: 'x'.repeat(101) });
    expect(errors[0]).toMatch(/at most 100/);
  });

  test('rejects invalid priority', () => {
    const { errors } = service.create({ title: 'A', priority: 'urgent' });
    expect(errors[0]).toMatch(/priority must be one of/);
  });

  test('assigns incrementing ids', () => {
    service.create({ title: 'A' });
    const { task } = service.create({ title: 'B' });
    expect(task.id).toBe(2);
  });

  test('filters by completed, priority and search', () => {
    service.create({ title: 'Buy milk', priority: 'low' });
    service.create({ title: 'Write report', priority: 'high' });
    service.update(2, { completed: true });

    expect(service.list({ completed: true })).toHaveLength(1);
    expect(service.list({ priority: 'low' })[0].title).toBe('Buy milk');
    expect(service.list({ search: 'REPORT' })).toHaveLength(1);
    expect(service.list()).toHaveLength(2);
  });

  test('update returns notFound for missing id', () => {
    expect(service.update(99, { title: 'x' })).toEqual({ notFound: true });
  });

  test('update validates completed type', () => {
    service.create({ title: 'A' });
    const { errors } = service.update(1, { completed: 'yes' });
    expect(errors[0]).toMatch(/completed must be a boolean/);
  });

  test('partial update keeps other fields', () => {
    service.create({ title: 'A', priority: 'high' });
    const { task } = service.update(1, { completed: true });
    expect(task.priority).toBe('high');
    expect(task.completed).toBe(true);
  });

  test('remove deletes existing and reports missing', () => {
    service.create({ title: 'A' });
    expect(service.remove(1)).toBe(true);
    expect(service.remove(1)).toBe(false);
  });

  test('stats are calculated correctly', () => {
    service.create({ title: 'A', priority: 'high' });
    service.create({ title: 'B', priority: 'low' });
    service.create({ title: 'C', priority: 'low' });
    service.update(1, { completed: true });

    expect(service.stats()).toEqual({
      total: 3,
      completed: 1,
      pending: 2,
      completionRate: 33,
      byPriority: { low: 2, medium: 0, high: 1 },
    });
  });

  test('stats on empty list do not divide by zero', () => {
    expect(service.stats().completionRate).toBe(0);
  });
});
