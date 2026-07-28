# Health & Wellness Recommendation Engine

Health & Wellness Recommendation Engine is a full-stack wellness platform for
tracking meals, workouts, water intake, nutrition, and personal progress. It
combines a React user experience, a secure Express API, MySQL persistence, and
a Python recommendation service to provide personalized exercise guidance.

## Features

- JWT-authenticated user profiles and wellness preferences
- Exercise, nutrition, water, meal-plan, favourite, and progress tracking
- Dashboard and progress analytics for daily and historical wellness data
- Personalized exercise and food recommendations
- Content-based, collaborative, hybrid, and deep-learning recommendation paths
- Recommendation interaction and feedback collection for future model training
- AI wellness assistant with private user context and conversation memory
- Workout-plan generation with recommendation fallbacks
- Responsive PWA frontend, Docker Compose local stack, and GitHub Actions CI

## Architecture

```text
Frontend (React static site)
        │
        │ VITE_API_URL
        ▼
Backend API (Node.js / Express)
        │
        ├──────────────────────────┐
        ▼                          ▼
MySQL database                ML Service (FastAPI)
                                      │
                                      ▼
                         Recommendation Engine
                 (content, collaborative, hybrid, deep)
```

The frontend communicates only with the backend API. The backend owns
authentication, application data, and optional Groq AI access. The ML service
is a separate dependency used by the backend and should be reachable only from
trusted backend infrastructure where possible.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, PWA support |
| Backend | Node.js, Express, JWT, Jest, Supertest |
| Database | MySQL 8.4 |
| ML service | Python, FastAPI, Pandas, NumPy, scikit-learn, TensorFlow |
| AI assistant | Groq OpenAI-compatible API with safe fallback responses |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Local setup

### 1. Configure environment variables

Environment files are ignored by Git. Copy the templates and replace every
`replace_with_...` placeholder with an environment-specific value:

```bash
cp .env.example .env
cp backend/.env.example backend/.env       # non-Docker backend runs only
cp ml-service/.env.example ml-service/.env # non-Docker ML runs only
cp frontend/.env.example frontend/.env.production
```

### 2. Start the services without Docker

Start MySQL first and apply `database/schema.sql`, then start each service:

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

The frontend development server needs `VITE_API_URL` to point to the backend
API. The backend needs `DB_*`, `JWT_SECRET`, and `ML_SERVICE_URL`. The ML
service needs `DB_*` when collaborative or deep recommendation features use
stored interaction data.

## Docker setup

Docker Compose starts the complete local stack: frontend, backend, ML service,
and MySQL.

```bash
docker compose up --build -d
docker compose ps
```

Default local URLs are:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:4173` |
| Backend API | `http://localhost:5050` |
| Backend health | `http://localhost:5050/health` |
| ML service | `http://localhost:8000` |
| ML health | `http://localhost:8000/health` |

Compose uses `mysql` as the internal database hostname and
`http://ml-service:8000` as the backend-to-ML URL. Stop the stack while
retaining the MySQL volume with:

```bash
docker compose down
```

## Environment variables

| Area | Variables |
| --- | --- |
| Frontend | `VITE_API_URL` — public backend URL including `/api`; embedded at build time |
| Backend | `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN`, `ML_SERVICE_URL` |
| AI (optional) | `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_API_URL` |
| ML service | `ML_SERVICE_HOST`, `ML_SERVICE_PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| Compose/MySQL | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |

`CORS_ORIGIN` accepts a comma-separated list of trusted frontend origins.
Only `VITE_` variables are exposed to the browser build; never put database
credentials, JWT secrets, Groq keys, or internal ML URLs in frontend variables.

## API overview

All API routes except authentication and health require a bearer token unless
otherwise noted. The base API URL is `/api`.

| Area | Routes |
| --- | --- |
| Health | `GET /health` |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login` |
| Profile and preferences | `GET /api/users/profile`, `POST /api/preferences` |
| Exercises and foods | `GET /api/exercises`, `GET /api/foods` |
| Tracking | `POST/GET /api/tracking/exercise`, `POST/GET /api/tracking/water`, `POST/GET /api/tracking/nutrition` |
| Plans | `/api/meal-plans`, `/api/workout-plans` |
| Recommendations | `GET /api/recommendations`, feedback and interaction routes under `/api/recommendations` |
| Analytics | `GET /api/dashboard`, `GET /api/progress/overview`, `GET /api/progress/history`, `GET /api/wellness/summary` |
| AI assistant | `POST /api/chat` |

Interactive API documentation is available from the backend at `/api-docs`.

## ML recommendation pipeline

1. The backend collects authenticated user preferences, profile context, and
   recommendation feedback/interactions.
2. It requests `/recommend/hybrid` from the ML service using the user profile
   and user ID.
3. The hybrid recommender ranks exercises by combining content similarity and
   collaborative interaction signals. New users receive content-based results.
4. The backend preserves the existing recommendation logic as a fallback if
   the ML service is unavailable, slow, or returns no usable recommendations.
5. The deep model is an additional prediction path and falls back to content
   recommendations when training data or a saved model is unavailable.

The recommendation APIs remain stable regardless of which model path is
available.

## Cloud deployment

Deploy each production concern as a separate service:

| Service | Deployment target | Required configuration |
| --- | --- | --- |
| Frontend | Static-site host or CDN | Build with `VITE_API_URL=https://api.example.com/api` |
| Backend | Node.js service | Managed MySQL credentials, `JWT_SECRET`, `CORS_ORIGIN`, and reachable `ML_SERVICE_URL` |
| ML service | Python/FastAPI service | Managed MySQL credentials and a private or public service URL reachable by the backend |
| Database | Managed MySQL | Dedicated application user and restricted network access |

Deploy in this order:

1. Provision managed MySQL, create the application database/user, and apply
   `database/schema.sql` plus the required seed/import process.
2. Deploy the ML service with its `DB_*` configuration, then verify its
   `/health` endpoint.
3. Deploy the backend with `NODE_ENV=production`, `DB_*`, a unique
   `JWT_SECRET`, `CORS_ORIGIN`, and the deployed `ML_SERVICE_URL`; verify
   `/health`.
4. Build and deploy frontend static assets with the final public
   `VITE_API_URL`. Include the frontend origin in `CORS_ORIGIN`.

## Verification

```bash
# Frontend production bundle
cd frontend && npm run build

# Backend tests
cd backend && npm test -- --runInBand

# ML tests
cd ml-service && python -m unittest
```

GitHub Actions runs the backend suite against isolated MySQL, builds the
frontend, runs ML tests, and validates all Docker images on every push and
pull request.

## Security and cleanup

- `.env` files are ignored; only the four `.env.example` templates are tracked.
- No API keys, database passwords, or JWT secrets are stored in source files.
- Production errors return generic unexpected-error messages while details are
  logged server-side.
- Existing console output is limited to operational startup, error, and model
  fallback logging; no tracked temporary scripts or debug artifacts remain.
