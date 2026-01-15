# Skill Garden Backend — Example requests (cURL)

Note: Replace <TOKEN> with a JWT returned by /api/auth/login or printed by the seed script.

1) Register

curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam", "email":"sam@example.com", "password":"pass1234"}'

2) Login

curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ava@example.com", "password":"password1"}'

3) Get daily challenge

curl http://localhost:4000/api/challenges/daily

4) List teams needing members

curl "http://localhost:4000/api/teams?status=Need%20Members"

5) Join a team (protected)

curl -X POST http://localhost:4000/api/teams/<TEAM_ID>/join \
  -H "Authorization: Bearer <TOKEN>"

6) Submit a challenge solution (protected)

curl -X POST http://localhost:4000/api/challenges/<CHALLENGE_ID>/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"solution":"I solved this by..."}'

7) Create a resource (protected)

curl -X POST http://localhost:4000/api/resources \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Note","category":"notes","description":"Useful note","tags":["JS"]}'

8) Get weekly leaderboard

curl http://localhost:4000/api/leaderboard/weekly

---

For more examples and to seed the DB, run:

npm run seed

This will print JWT tokens for seeded users that you can use in Authorization headers. Ensure the server is running separately (npm run dev) when testing endpoints.