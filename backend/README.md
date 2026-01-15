# Skill Garden — Backend

Development backend for Skill Garden (Node.js, Express, MongoDB)

Quickstart

1. Copy `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install deps: `npm install`.
3. Seed sample data: `npm run seed` (prints sample JWT tokens).
4. Run server: `npm run dev`.

API

See `API_EXAMPLES.md` for example cURL requests. Endpoints are mounted at `/api/*` and return JSON. Frontend will call endpoints like:
- `POST /api/auth/login` → { token } used as `Authorization: Bearer <token>`
- `GET /api/challenges/daily` → daily challenge
- `GET /api/teams?status=Need%20Members` → team list
- `POST /api/teams/:id/join` (protected)
- `POST /api/challenges/:id/submit` (protected)
- `GET /api/leaderboard/weekly` → leaderboard

Notes

- No secrets are committed. Use `.env` locally and in CI.
- For production, secure MongoDB credentials and rotate JWT secret.

