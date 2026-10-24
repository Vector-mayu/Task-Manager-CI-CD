'use strict';

const path = require('path');
const express = require('express');
const helloRoutes = require('./routes/hello');
const createTaskRouter = require('./routes/tasks');
const { TaskService } = require('./services/taskService');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(taskService = new TaskService()) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/', helloRoutes);
  app.use('/api/tasks', createTaskRouter(taskService));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
