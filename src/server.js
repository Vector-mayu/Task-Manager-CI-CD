'use strict';

const { createApp } = require('./app');

// Port priority: --port=8082  >  PORT env var  >  3000
function resolvePort() {
  const arg = process.argv.find((a) => a.startsWith('--port='));
  if (arg) return Number(arg.split('=')[1]);
  return Number(process.env.PORT) || 3000;
}

const port = resolvePort();
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Task Manager API running on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
