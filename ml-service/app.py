"""Phase 1 FastAPI foundation for the ML recommendation service.

This module intentionally exposes only the health check and a placeholder
recommendation endpoint. It is not wired into the backend recommendation flow
yet, so existing recommendation behaviour remains unchanged.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from models.content_recommender import ContentBasedRecommender


app = FastAPI(title="Health Wellness ML Service")
recommender = ContentBasedRecommender()


class UserProfile(BaseModel):
    """The initial user data contract for future recommendation requests."""

    fitness_goal: str
    activity_level: str


class RecommendationRequest(BaseModel):
    """Placeholder request body for the content-based recommender."""

    user_profile: UserProfile


@app.get("/health")
def health_check() -> dict[str, str]:
    """Confirm that the standalone ML service is available."""

    return {"status": "ML service running"}


@app.post("/recommend")
def recommend(
    request: RecommendationRequest,
    top_n: int = Query(default=5, ge=1, le=50),
) -> dict[str, list]:
    """Return content-based exercise recommendations for a user profile."""

    try:
        recommendations = recommender.recommend(
            request.user_profile.model_dump(),
            top_n=top_n,
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    return {"recommendations": recommendations}
