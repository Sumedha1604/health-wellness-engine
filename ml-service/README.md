# Health Wellness ML Service

This service provides content-based exercise recommendations while the backend
keeps its existing recommendation system available as a fallback.

## Planned model

`ContentBasedRecommender` one-hot encodes exercise type, body part, equipment,
and difficulty level (plus target muscles when a future dataset provides them).
It builds a user-profile vector from fitness goal and activity level, then uses
cosine similarity to rank exercises. Later phases may add additional signals
and model evaluation.

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
