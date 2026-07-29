# Health Wellness ML Service

This service provides content-based, collaborative, and hybrid exercise
recommendations while the backend keeps its existing recommendation system
available as a fallback.

## Recommendation architecture overview

```text
Frontend → Backend API → ML Service → MySQL
              │               │
              │               ├─ Content-based ranking
              │               ├─ Collaborative ranking
              │               └─ Hybrid score combination
              └────────────────── Application data and fallback responses
```

The frontend never calls the ML service or database directly. The authenticated
backend assembles a user profile and requests recommendations from the FastAPI
ML service. Content ranking reads the exercise and food catalogues;
collaborative ranking reads persisted recommendation interactions from MySQL.
The backend validates and formats model results and retains its existing
fallback path when the ML service is unavailable or returns no usable result.

## Content-based recommendations

`ContentBasedRecommender` one-hot encodes exercise type, body part, equipment,
and difficulty level (plus target muscles when a future dataset provides them).
It maps fitness goal, activity level, and optional body-part/equipment
preferences into the same feature space, calculates cosine similarity, and
ranks the closest exercises. This path does not require interaction history, so
it provides deterministic cold-start recommendations for a new user.

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
rankings by exercise id. It first min-max normalizes each model's scores. When
both models recommend the same exercise, its final score is calculated as
`content_score * 0.5 + collaborative_score * 0.5`.

For a new user or a user without usable interaction data, the hybrid pipeline
uses content-based results without reducing their scores. If either model is
temporarily unavailable, results from the other healthy model are returned.
This gives the backend a single ML endpoint while preserving cold-start support.

## Explainable recommendations

Exercise recommendations include a `reason` alongside their score. Content
recommendations explain matching fitness goals, activity-based difficulty, and
an optional preferred body part. Collaborative recommendations identify the
similar-user preference signal. Hybrid recommendations preserve the matching
profile explanation and add the collaborative signal when both models contribute.

Food similarity recommendations also return a nutrition-profile reason. Reasons
are explanatory metadata only and do not change ranking scores or API routes.

Food ranking uses robustly normalized calories, protein, carbohydrates, and fat.
Legacy seed-food requests rank by macro similarity; callers that provide a user
profile additionally receive ranking by fitness goal, diet type, calorie target,
protein target, nutrition similarity, and feedback. All signals are normalized
before their configurable weighted combination, while response fields and API
routes remain unchanged.

## Deep wellness prediction

`DeepRecommendationModel` is a TensorFlow/Keras dense classifier that predicts
the workout category a user is most likely to prefer. Its inputs use only fields
available in this project: gender, fitness goal, activity level, height, weight,
exercise-log aggregates, nutrition-log aggregates, water totals, and interaction
counts. The schema does not contain age, so age is not modelled.

Training labels are derived from each user's strongest positive interaction
category (`COMPLETED`, `FAVORITED`, or ratings of four or five). The model uses
two ReLU dense layers followed by a softmax category output. It trains only when
there are enough real labelled interaction records and at least two categories;
otherwise no model is saved and the API uses content-based recommendations.

Train with real database data:

```bash
cd ml-service
python -m training.train_deep_recommender
```

Saved Keras artifacts are written to `models/saved/` and are intentionally not
committed. No accuracy metric is claimed until the model is evaluated on a
separate held-out dataset.

## Recommendation evaluation metrics

Offline evaluation compares an ordered list of recommendation results against
each user's recorded positive interactions. The evaluator reports:

- **Precision@K**: the fraction of the first K recommendations that were
  actually interacted with.
- **Recall@K**: the fraction of a user's actual interactions found in the
  first K recommendations.
- **F1@K**: the harmonic mean of Precision@K and Recall@K.
- **NDCG@K**: ranking quality that gives more credit when relevant items appear
  near the top of the recommendation list.

Generate the reproducible synthetic benchmark from the processed exercise and
food catalogues, then evaluate the existing recommendation pipelines:

```bash
cd ml-service
python evaluation/generate_test_data.py
python evaluation/evaluate_recommendations.py
```

The default cutoff is 5. Use a different cutoff or dataset with:

```bash
python evaluation/evaluate_recommendations.py \
  --data data/test_interactions.csv \
  --k 10
```

The generator creates deterministic synthetic users covering weight loss,
muscle gain, endurance, and general fitness, with varied activity levels, body
parts, equipment, and diet preferences. Positive exercise labels independently match the
profile's goal, activity level, and exercise attributes; positive food labels
match diet-specific nutrition rules. Low-scoring, unrelated catalogue items are
labelled negative. The CSV contains `user_id`, `item_id`, `item_type`, and a
binary `interaction` label (`1` for positive and `0` for negative).

Evaluation uses the existing hybrid pipeline's cold-start content behaviour for
exercise users and the existing food-similarity pipeline for foods. Metrics are
macro-averaged across user/item-type cohorts so exercise and food scenarios have
equal weight. Synthetic labels are generated from explicit relevance rules, not
by copying the recommenders' output.

Hybrid ranking normalizes content and collaborative scores separately before
combining them. Constructor weights are configurable for content similarity,
collaborative similarity, goal match, activity match, difficulty match, and diet
match; unavailable signals do not dilute the remaining evidence.

Metrics return `0.0` when no recommendations or no actual interactions are
available, so cold-start users do not cause an evaluation failure. Use an
exported JSON file in either of these formats:

```json
[
  {"user_id": 1, "recommendations": [{"exercise_id": 12}, {"exercise_id": 8}]}
]
```

```json
{"1": [12, 8]}
```

Then run the standalone evaluator with the recommendation results and the
processed interaction export:

```bash
cd ml-service
python evaluate_model.py \
  --recommendations path/to/recommendation-results.json \
  --interactions datasets/processed/interactions.csv \
  --k 5
```

## Evaluation methodology

The reproducible offline evaluation uses `data/test_interactions.csv`, generated
from the processed exercise and food catalogues with a fixed set of 24 synthetic
profiles. Each profile contributes ten relevant and ten non-relevant exercise
labels plus ten relevant and ten non-relevant food labels. Relevance rules are
based on profile goals, activity level, body part, equipment, diet, calories,
protein, and macronutrients; they do not copy the recommender's output.

For every user/item-type cohort, the evaluator requests five ranked items,
compares them with the ten relevant labels, and calculates Precision@5,
Recall@5, F1@5, and binary NDCG@5. The final figures are macro-averages over 48
cohorts, giving every user and item type equal weight. Exercise evaluation uses
the hybrid pipeline in its cold-start content mode because synthetic users have
no database interaction history. Food evaluation uses the food similarity
pipeline. These values measure the checked-in deterministic benchmark and
should not be interpreted as online user satisfaction or production accuracy.

## Model Performance

Measured with `python evaluation/evaluate_recommendations.py` at `K=5`:

| Measurement | Result |
| --- | ---: |
| Dataset size | 960 labelled rows |
| Users evaluated | 24 |
| User/item cohorts | 48 |
| Precision@5 | 0.8667 |
| Recall@5 | 0.4333 |
| F1@5 | 0.5778 |
| NDCG@5 | 0.8647 |

The dataset contains 480 positive and 480 negative labels. Because each cohort
has ten relevant items but evaluation returns at most five, Recall@5 is bounded
by 0.5 for this benchmark.

## ML training workflow

The offline training pipeline builds a user-item preference matrix from real
interaction exports, calculates user cosine similarity, and saves a pickle
artifact. It does not alter the running API models or recommendation endpoints.

The input CSV must contain `user_id`, `exercise_id`, `rating`, `completed`, and
`timestamp`. A small schema-valid sample is available at
`data/sample_interactions.csv` for local verification.

```bash
cd ml-service
python -m training.train_recommendation_model \
  --data data/sample_interactions.csv \
  --output models/saved/recommendation_model.pkl
```

Trained artifacts are written to `models/saved/`. Use production interaction
exports when training a real model; the supplied sample dataset is only for
verifying the pipeline.

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

Request deep recommendations (falls back to content recommendations when the
deep model has not been trained):

```bash
curl -X POST http://localhost:8000/recommend/deep \
  -H "Content-Type: application/json" \
  -d '{"user_profile":{"fitness_goal":"Muscle Gain","activity_level":"Beginner","weight":70}}'
```
