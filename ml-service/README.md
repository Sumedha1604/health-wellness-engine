# Health Wellness ML Service

This service provides content-based, collaborative, and hybrid exercise
recommendations while the backend keeps its existing recommendation system
available as a fallback.

## Content-based recommendations

`ContentBasedRecommender` one-hot encodes exercise type, body part, equipment,
and difficulty level (plus target muscles when a future dataset provides them).
It builds a user-profile vector from fitness goal and activity level, then uses
cosine similarity to rank exercises. Later phases may add additional signals
and model evaluation.

## Collaborative recommendations

`CollaborativeRecommender` reads real `recommendation_interactions` records
from the application database. It turns actions, ratings, and completion data
into a user-item preference matrix, then uses cosine similarity to identify
users with comparable exercise behaviour. It recommends positive interactions
from similar users that the requesting user has not interacted with.

Content-based recommendations use exercise attributes and a user's stated
profile. Collaborative recommendations use behaviour shared across users. New
users, users without interactions, and users without positive similarity receive
an empty list rather than generated or fake recommendations.

## Hybrid recommendations

`HybridRecommender` combines the independent content-based and collaborative
rankings by exercise id. When both models recommend the same exercise, its final
score is calculated as `content_score * 0.5 + collaborative_score * 0.5`.

For a new user or a user without usable interaction data, the hybrid pipeline
uses content-based results without reducing their scores. If either model is
temporarily unavailable, results from the other healthy model are returned.
This gives the backend a single ML endpoint while preserving cold-start support.

## Communication flow

```text
Backend → ML Service → Recommendation Model
```

The standalone `/recommend` endpoint is available for a future backend
integration phase. The current backend recommendation behaviour is unchanged.

## Run locally

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --reload
```

Verify the service:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ML service running"}
```

Send a recommendation request:

```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_profile":{"fitness_goal":"Improve Endurance","activity_level":"Beginner"}}'
```

Request collaborative recommendations:

```bash
curl -X POST http://localhost:8000/recommend/collaborative \
  -H "Content-Type: application/json" \
  -d '{"user_id":1}'
```

Request hybrid recommendations:

```bash
curl -X POST http://localhost:8000/recommend/hybrid \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"user_profile":{"fitness_goal":"Improve Endurance","activity_level":"Beginner"}}'
```
