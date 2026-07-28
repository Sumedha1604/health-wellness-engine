# 🩺 Intelligent Health & Wellness Recommendation Engine

A production-quality full-stack AI-powered Health & Wellness Recommendation Engine that delivers personalized nutrition and wellness recommendations using Machine Learning, REST APIs, and a scalable backend architecture.

---

# 🚀 Tech Stack

## Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

## Backend
- Node.js
- Express.js
- JWT Authentication
- RESTful APIs
- Jest & Supertest

## Machine Learning
- Python
- Scikit-learn
- Pandas
- NumPy
- SQLAlchemy

## Database
- MySQL 8.4
- Docker Compose

## DevOps
- Docker
- Docker Compose
- GitHub Actions (CI/CD)
- Git

---

# ✨ Features

- 🔐 Secure JWT Authentication
- 👤 User Profile Management
- 🥗 Personalized Meal Plans
- ❤️ Favourite Foods & Exercises
- 📊 Dashboard Analytics
- 🤖 AI-powered Health Recommendations
- 💬 AI wellness assistant with private per-user conversation memory
- 🧠 Hybrid ML exercise recommendations in assistant wellness context
- 🗃️ Automated Food Dataset Import Pipeline
- 🧪 49 Backend Integration Tests
- 📈 Automated Test Coverage Reports
- ⚙️ Continuous Integration with GitHub Actions

---

# 📁 Project Structure

```text
health-wellness-engine/
│
├── backend/
├── frontend/
├── data_pipeline/
├── database/
├── docker/
├── datasets/
├── docker-compose.yml
└── README.md
```

---

# 🧪 Testing

The backend includes a comprehensive integration test suite.

- ✅ 49 Tests
- ✅ 9 Test Suites
- ✅ Jest
- ✅ Supertest
- ✅ Automated GitHub Actions Pipeline

Run locally:

```bash
cd backend
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

---

# 🤖 AI Assistant Architecture

`POST /api/chat` is protected by JWT authentication. For each request, the
backend retrieves only the authenticated user's profile and preferences,
today's nutrition, hydration, recent workouts, progress streak, recent chat
turns, and hybrid ML recommendations. That context is sent to Groq with a
structured wellness prompt.

Conversation memory is stored as individual `user` and `assistant` turns in
`chat_history`. Only the ten most recent turns for the authenticated user are
included in a model request. If Groq or an ML service is unavailable, the
existing safe fallback response remains available and no API key is returned to
the client.

---

# 🐳 Running with Docker

Start MySQL:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down -v
```

---

# 📊 Continuous Integration

GitHub Actions automatically:

- Installs dependencies
- Starts MySQL
- Initializes the database
- Imports the food dataset
- Runs backend integration tests
- Generates coverage reports

---

# 👩‍💻 Author

Developed by **Sumedha**
