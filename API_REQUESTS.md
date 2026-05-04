# Kittygram — Lost Cats Feature

A community for cat owners with a "Lost Cats" reporting system: users can post reports about their lost cats, browse other reports, and share sightings/tips.

---

## Quick Start

```bash
# 1. Copy env template
cp .env.example .env   # Windows: copy .env.example .env

# 2. Build and start everything (postgres + Django + React + nginx)
docker-compose up --build

# 3. (First run only) Create an admin user
docker-compose exec backend python manage.py createsuperuser
```

Migrations and `collectstatic` run automatically on backend startup via `backend/entrypoint.sh`.

Once everything is up:

| URL | What |
|---|---|
| http://localhost:9000/ | React frontend (sign in / sign up / cats / lost cats) |
| http://localhost:9000/api/ | DRF browsable API root |
| http://localhost:9000/api/docs/ | **Swagger UI** (interactive API documentation) |
| http://localhost:9000/api/redoc/ | ReDoc (alternative documentation UI) |
| http://localhost:9000/api/docs/swagger.json | OpenAPI 2.0 schema |
| http://localhost:9000/admin/ | Django admin |

---

## Useful Docker Commands

```bash
# Tail backend logs
docker-compose logs -f backend

# Open a Django shell
docker-compose exec backend python manage.py shell

# Apply migrations manually
docker-compose exec backend python manage.py migrate

# Run the test suite
docker-compose exec backend pytest

# Stop everything
docker-compose down

# Stop everything AND wipe the database / volumes
docker-compose down -v
```

---

## API Endpoints (Lost Cats)

| Method | URL | Auth | Notes |
|---|---|---|---|
| GET    | `/api/lost-cats/` | Public | Paginated; supports `?search=`, `?is_resolved=`, `?date_lost=`, `?ordering=` |
| POST   | `/api/lost-cats/` | Required | Create a report (sets `reported_by` to the current user) |
| GET    | `/api/lost-cats/{id}/` | Public | Detailed view incl. nested sightings |
| PUT    | `/api/lost-cats/{id}/` | Owner | Full update |
| PATCH  | `/api/lost-cats/{id}/` | Owner | Partial update (incl. `is_resolved`) |
| DELETE | `/api/lost-cats/{id}/` | Owner / staff | |
| POST   | `/api/lost-cats/{id}/resolve/` | Owner | Convenience action: marks as found |
| GET    | `/api/lost-cats/{id}/sightings/` | Public | List sightings for a report |
| POST   | `/api/lost-cats/{id}/sightings/` | Required | Add a sighting |
| DELETE | `/api/lost-cats/{id}/sightings/{sid}/` | Author / staff | |

---

## Example API Requests (curl)

Replace `YOUR_TOKEN` with the token returned by `POST /api/token/login/`.

### 1. List all reports (guest, no auth)

```bash
curl http://localhost:9000/api/lost-cats/
```

With filters:

```bash
curl "http://localhost:9000/api/lost-cats/?is_resolved=false&search=park&ordering=-date_lost"
```

### 2. Create a new lost cat report (authenticated)

```bash
curl -X POST http://localhost:9000/api/lost-cats/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cat": 1,
    "description": "My orange tabby went missing from the backyard, last seen near the fence.",
    "last_seen_location": "Central Park, near the fountain",
    "date_lost": "2026-05-03"
  }'
```

### 3. Attempt without auth (expect 401)

```bash
curl -i -X POST http://localhost:9000/api/lost-cats/ \
  -H "Content-Type: application/json" \
  -d '{"cat": 1, "description": "...", "last_seen_location": "Park", "date_lost": "2026-05-03"}'
```

```json
{ "detail": "Authentication credentials were not provided." }
```

### 4. Retrieve a single report

```bash
curl http://localhost:9000/api/lost-cats/1/
```

### 5. Mark as resolved (owner only)

Convenience action:

```bash
curl -X POST http://localhost:9000/api/lost-cats/1/resolve/ \
  -H "Authorization: Token YOUR_TOKEN"
```

Or via PATCH:

```bash
curl -X PATCH http://localhost:9000/api/lost-cats/1/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_resolved": true}'
```

### 6. Non-owner tries to edit (expect 403)

```bash
curl -i -X PATCH http://localhost:9000/api/lost-cats/1/ \
  -H "Authorization: Token OTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Trying to edit somebody elses report content here"}'
```

```json
{ "detail": "You do not have permission to perform this action." }
```

### 7. Add a sighting (authenticated)

```bash
curl -X POST http://localhost:9000/api/lost-cats/1/sightings/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I think I saw this cat near the old library on 5th street!",
    "sighting_location": "5th Street, near the library"
  }'
```

### 8. Validation error: description too short (expect 400)

```bash
curl -i -X POST http://localhost:9000/api/lost-cats/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cat": 1,
    "description": "Short desc",
    "last_seen_location": "Park",
    "date_lost": "2026-05-03"
  }'
```

```json
{ "description": ["This field must be at least 20 characters long."] }
```

---

## Authentication flow

```bash
# Register
curl -X POST http://localhost:9000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "supersecure123"}'

# Login (get token)
curl -X POST http://localhost:9000/api/token/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "supersecure123"}'
# → {"auth_token": "abc123..."}

# Logout (invalidate token)
curl -X POST http://localhost:9000/api/token/logout/ \
  -H "Authorization: Token abc123..."
```

---

## Project Structure

```
kittygram_final/
├── backend/
│   ├── cats/               # existing cats app
│   ├── lost_cats/          # new "Lost Cats" feature app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── filters.py
│   │   ├── urls.py
│   │   ├── apps.py
│   │   ├── admin.py
│   │   └── migrations/
│   ├── kittygram_backend/  # project settings + URLs (Swagger registered here)
│   ├── entrypoint.sh       # runs migrations + collectstatic at container start
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React 17 SPA
│   └── src/components/
│       ├── lost-cats-page/         # public list + filters + pagination
│       ├── lost-cat-detail-page/   # detail + sightings + resolve/delete
│       └── add-lost-cat-page/      # create form (auth-gated)
├── nginx/                  # reverse proxy (gateway)
├── docker-compose.yml
└── .env.example
```

---

## Notes on Implementation Decisions

- **Swagger via `drf-yasg`**: chosen for compatibility with Django 3.2 / DRF 3.13. Swagger UI is mounted at `/api/docs/`, ReDoc at `/api/redoc/`. The schema view is public (`AllowAny`) so visitors can browse the API without logging in. Token authentication is wired in via `SECURITY_DEFINITIONS` so you can click "Authorize" in Swagger UI and paste `Token <your-token>`.
- **CORS**: configured via `django-cors-headers` to allow the React dev server (`npm start`) to call the API directly during development. In production, frontend and API are served from the same nginx origin so CORS is moot.
- **Permissions**: custom `IsOwnerOrReadOnly` (anyone reads, owner writes) and `IsOwnerOrAdmin` (owner-or-staff for destructive actions). Object-level permissions check `obj.reported_by` for reports and `obj.author` for sightings.
- **DB-level integrity**: a partial unique constraint (`unique_active_lost_report_per_cat`) prevents two active reports for the same cat at the database layer, complementing the validator in the serializer.
- **Auto-migration on boot**: `entrypoint.sh` runs `makemigrations`, `migrate`, and `collectstatic` before handing off to gunicorn. Static files for admin / Swagger UI / DRF browsable API are copied into the shared nginx volume.
- **No frontend rebuild needed for API changes**: the frontend talks to relative `/api/...` URLs, so it works behind the nginx gateway without any environment-specific config.
