# Health & Wellness Recommendation Engine

A full-stack wellness application with nutrition and exercise tracking,
personalized recommendations, an AI assistant, and Python ML recommenders.

## Production architecture

```text
Browser
  │
  ▼
Frontend (Vite build)
  │  HTTPS requests to VITE_API_URL
  ▼
Backend API (Express)
  ├───────────────────────┐
  ▼                       ▼
MySQL                 ML Service (FastAPI)
                            │
                            ▼
                    Recommendation models
```

The backend is the only service that receives browser authentication tokens.
The ML service is an internal dependency, while optional Groq credentials stay
on the backend and are never sent to the frontend.

## Production configuration

Environment files are intentionally ignored by Git. Start from the templates:

```bash
cp .env.example .env
cp backend/.env.example backend/.env       # non-Docker backend runs only
cp ml-service/.env.example ml-service/.env # non-Docker ML runs only
cp frontend/.env.example frontend/.env.production
```

Replace every `replace_with_...` placeholder with a unique production value.
Never commit `.env` files, JWT secrets, database passwords, or provider API
keys.

### Required variables

| Area | Variables |
| --- | --- |
| Frontend | `VITE_API_URL` (the public backend URL, including `/api`) |
| Backend | `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN`, `ML_SERVICE_URL` |
| AI (optional) | `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_API_URL` |
| ML service | `ML_SERVICE_HOST`, `ML_SERVICE_PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| Compose/MySQL | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |

`VITE_API_URL` is embedded during the frontend build, so it must be the final
public API address before building the frontend image. `CORS_ORIGIN` accepts a
comma-separated list of trusted browser origins, for example
`https://app.example.com,https://admin.example.com`.

## Cloud deployment

Deploy each production concern as a separate service:

| Service | Deployment target | Required configuration |
| --- | --- | --- |
| Frontend | Static-site host or CDN | Build with `VITE_API_URL=https://api.example.com/api` |
| Backend | Node.js service | Managed MySQL credentials, `JWT_SECRET`, `CORS_ORIGIN`, and reachable `ML_SERVICE_URL` |
| ML service | Python/FastAPI service | Managed MySQL credentials and a private or public service URL reachable by the backend |
| Database | Managed MySQL | Create a dedicated application user and restrict network access to the backend and ML service |

### Deployment order

1. Provision the managed MySQL instance, create the application database and
   least-privilege application user, then apply `database/schema.sql` and the
   required seed/import process.
2. Deploy the ML service. Configure its `DB_*` variables using the managed
   database endpoint. Confirm `https://ml.example.com/health` returns the ML
   health response. Prefer private networking where the platform supports it.
3. Deploy the backend with `NODE_ENV=production`, its `DB_*` variables,
   a unique `JWT_SECRET`, `CORS_ORIGIN=https://app.example.com`, and
   `ML_SERVICE_URL` pointing to the deployed ML service. Confirm
   `https://api.example.com/health` returns `{"status":"healthy"}`.
4. Build and deploy the frontend static assets with
   `VITE_API_URL=https://api.example.com/api`. Its origin must be included in
   the backend `CORS_ORIGIN` value.

Do not expose database credentials, `JWT_SECRET`, `GROQ_API_KEY`, or internal
ML URLs in frontend variables. Only variables prefixed with `VITE_` are exposed
to the built browser bundle.

## Docker deployment

1. Create and complete the root `.env` file as above.
2. Set `VITE_API_URL` to your public API URL and `CORS_ORIGIN` to your public
   frontend URL.
3. Build and start the stack:

```bash
docker compose up --build -d
docker compose ps
```

The Compose network uses service names internally: the backend and ML service
connect to MySQL at `mysql`, and the backend connects to the ML service at
`http://ml-service:8000`. Expose only the ports required by your deployment
platform or reverse proxy.

The health endpoints are:

```text
GET /health              Backend health check
GET /health              ML service health check (on the ML service host/port)
```

For local development, Docker exposes the frontend on port `4173`, backend on
`5050`, and ML service on `8000` unless overridden in `.env`.

Stop containers while retaining MySQL data:

```bash
docker compose down
```

## Local development

```bash
# Backend
cd backend
npm ci
npm start

# Frontend
cd frontend
npm ci
npm run dev

# ML service
cd ml-service
python -m pip install -r requirements.txt
uvicorn app:app --reload
```

## Verification

```bash
# Frontend production bundle
cd frontend && npm run build

# Backend tests
cd backend && npm test -- --runInBand

# ML tests
cd ml-service && python -m unittest
```

GitHub Actions runs the backend suite against an isolated MySQL service,
builds the frontend, runs ML tests, and validates all three Docker images on
every push and pull request.

## Security and operational notes

- `.env` files are ignored; commit only the `*.env.example` templates.
- Set a long, random `JWT_SECRET` for every environment.
- Restrict `CORS_ORIGIN` in production; an empty value retains permissive
  development behavior for compatibility.
- The backend returns generic messages for unexpected errors in production and
  logs error details server-side.
- The AI assistant safely falls back when Groq is not configured or unavailable.
