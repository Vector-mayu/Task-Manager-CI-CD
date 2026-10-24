'use strict';

const VALID_PRIORITIES = ['low', 'medium', 'high'];

class TaskService {
  constructor() {
    this.reset();
  }

  reset() {
    this.tasks = [];
    this.nextId = 1;
  }

  validate({ title, priority }, { partial = false } = {}) {
    const errors = [];

    if (!partial || title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        errors.push('title is required and must be a non-empty string');
      } else if (title.trim().length > 100) {
        errors.push('title must be at most 100 characters');
      }
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    return errors;
  }

  create(data) {
    const errors = this.validate(data);
    if (errors.length) return { errors };

    const task = {
      id: this.nextId++,
      title: data.title.trim(),
      priority: data.priority || 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return { task };
  }

  list({ completed, priority, search } = {}) {
    return this.tasks.filter((t) => {
      if (completed !== undefined && t.completed !== completed) return false;
      if (priority && t.priority !== priority) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  get(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  update(id, data) {
    const task = this.get(id);
    if (!task) return { notFound: true };

    const errors = this.validate(data, { partial: true });
    if (data.completed !== undefined && typeof data.completed !== 'boolean') {
      errors.push('completed must be a boolean');
    }
    if (errors.length) return { errors };

    if (data.title !== undefined) task.title = data.title.trim();
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.completed !== undefined) task.completed = data.completed;
    return { task };
  }

  remove(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  stats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const byPriority = { low: 0, medium: 0, high: 0 };
    this.tasks.forEach((t) => {
      byPriority[t.priority] += 1;
    });
    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      byPriority,
    };
  }
}

module.exports = { TaskService, VALID_PRIORITIES };
