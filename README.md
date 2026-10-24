# GitHub Actions Node Demo - Task Manager API

Node.js + Express app used to practise CI/CD with GitHub Actions.

## Run locally
```bash
npm install
npm start                    # http://localhost:3000
npm start -- --port=8082     # custom port
npm test                     # run Jest tests
```

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hello`, `/bye`, `/hi` | Simple text endpoints (same as the Java demo) |
| GET | `/health` | Health check |
| GET | `/` | Small web UI |
| GET | `/api/tasks` | List tasks (`?completed=true&priority=high&search=text`) |
| POST | `/api/tasks` | Create `{ "title": "...", "priority": "low\|medium\|high" }` |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update `title`, `priority`, `completed` |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/stats` | Totals, completion rate, count by priority |

## CI/CD
- `.github/workflows/pre-tests.yml` - runs tests on Node 20 and 22 for every push/PR to `main`.
- `.github/workflows/deploy.yml` - on merged PR to `main`, a **self-hosted** runner installs, tests, restarts the app on port **8082** and verifies `/hello`.

### One-time server setup (Ubuntu self-hosted runner)
```bash
sudo mkdir -p /home/node-demo/githubActionNodeDemo
sudo chown -R <runner-user>:<runner-user> /home/node-demo
```
Node.js 20+ is installed by `actions/setup-node`; `curl` must exist on the server.
