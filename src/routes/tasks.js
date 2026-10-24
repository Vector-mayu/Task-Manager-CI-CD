'use strict';

const express = require('express');

function createTaskRouter(taskService) {
  const router = express.Router();

  const parseId = (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'id must be a positive integer' });
      return null;
    }
    return id;
  };

  router.get('/stats', (req, res) => {
    res.json(taskService.stats());
  });

  router.get('/', (req, res) => {
    const { completed, priority, search } = req.query;
    const filters = { priority, search };
    if (completed === 'true') filters.completed = true;
    if (completed === 'false') filters.completed = false;
    res.json(taskService.list(filters));
  });

  router.get('/:id', (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const task = taskService.get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  });

  router.post('/', (req, res) => {
    const { task, errors } = taskService.create(req.body || {});
    if (errors) return res.status(400).json({ errors });
    return res.status(201).json(task);
  });

  router.put('/:id', (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    const { task, errors, notFound } = taskService.update(id, req.body || {});
    if (notFound) return res.status(404).json({ error: 'Task not found' });
    if (errors) return res.status(400).json({ errors });
    return res.json(task);
  });

  router.delete('/:id', (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;
    if (!taskService.remove(id)) return res.status(404).json({ error: 'Task not found' });
    return res.status(204).send();
  });

  return router;
}

module.exports = createTaskRouter;
