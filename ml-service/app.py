"""FastAPI entry point for content-based and collaborative recommendations."""

from pathlib import Path
from typing import Any
import json

import mysql.connector
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from models.content_recommender import ContentBasedRecommender
from models.collaborative_recommender import CollaborativeRecommender
from models.deep_recommender import DeepRecommendationModel
from models.hybrid_recommender import HybridRecommender
from models.food_recommender import recommend_foods


SERVICE_ROOT = Path(__file__).resolve().parent
load_dotenv(SERVICE_ROOT / ".env")

app = FastAPI(title="Health Wellness ML Service")
recommender = ContentBasedRecommender()


class UserProfile(BaseModel):
    """The initial user data contract for future recommendation requests."""

    fitness_goal: str
    activity_level: str
    weight: float | None = None
    weight_kg: float | None = None
    height_cm: float | None = None
    gender: str | None = None


class RecommendationRequest(BaseModel):
    """Placeholder request body for the content-based recommender."""

    user_profile: UserProfile


class CollaborativeRecommendationRequest(BaseModel):
    """Request body for a user-based collaborative recommendation query."""

    user_id: int


class HybridRecommendationRequest(BaseModel):
    """Request body for combined profile and collaborative recommendations."""

    user_profile: UserProfile
    user_id: int


class DeepRecommendationRequest(BaseModel):
    """Request body for deep category prediction with content fallback."""

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


@app.post("/recommend/collaborative")
def recommend_collaborative(
    request: CollaborativeRecommendationRequest,
    top_n: int = Query(default=5, ge=1, le=50),
) -> dict[str, list]:
    """Return recommendations from similar users' real interactions."""

    try:
        recommendations = CollaborativeRecommender().recommend(
            request.user_id,
            top_n=top_n,
        )
    except (ValueError, mysql.connector.Error):
        recommendations = []

    return {"recommendations": recommendations}


@app.post("/recommend/hybrid")
def recommend_hybrid(
    request: HybridRecommendationRequest,
    top_n: int = Query(default=5, ge=1, le=50),
) -> dict[str, list]:
    """Return recommendations from every ML signal currently available."""

    try:
        recommendations = HybridRecommender().recommend(
            request.user_profile.model_dump(),
            request.user_id,
            top_n=top_n,
        )
    except (ValueError, mysql.connector.Error):
        recommendations = []

    return {"recommendations": recommendations}


@app.post("/recommend/deep")
def recommend_deep(
    request: DeepRecommendationRequest,
    top_n: int = Query(default=5, ge=1, le=50),
) -> dict[str, list[dict[str, Any]]]:
    """Use a trained deep category model, or content recommendations as fallback."""

    profile = request.user_profile.model_dump(exclude_none=True)
    content_recommender = ContentBasedRecommender()

    try:
        # Content remains the safe cold-start fallback when no trained Keras
        # model is available or real data was insufficient for training.
        content_recommendations = content_recommender.recommend(profile, top_n=50)
    except (FileNotFoundError, ValueError):
        return {"recommendations": []}

    prediction = DeepRecommendationModel().predict(profile)
    if prediction is None:
        return {
            "recommendations": [
                {**recommendation, "source": "content"}
                for recommendation in content_recommendations[:top_n]
            ]
        }

    predicted_category = prediction["workout_category"].strip().lower()
    exercise_types = content_recommender.exercises.set_index(
        "exercise_id"
    )["exercise_type"].to_dict()
    deep_recommendations = [
        {**recommendation, "source": "deep"}
        for recommendation in content_recommendations
        if str(exercise_types.get(recommendation["exercise_id"], "")).lower()
        == predicted_category
    ][:top_n]

    # The model can predict a category not represented in the user's top
    # content candidates. Do not return an error in that situation.
    return {
        "recommendations": deep_recommendations or [
            {**recommendation, "source": "content"}
            for recommendation in content_recommendations[:top_n]
        ]
    }


@app.get("/recommendations/food/{food_id}")
def recommend_foods_for_user(
    food_id: int,
    feedback: str | None = None,
    limit: int = Query(default=5, ge=1, le=50),
) -> list[dict[str, Any]]:
    """Return existing food-model recommendations for the selected food."""

    try:
        feedback_scores = json.loads(feedback) if feedback else {}
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=422, detail="Invalid feedback payload") from error

    try:
        return recommend_foods(
            food_id,
            limit=limit,
            feedback_scores=feedback_scores,
        )
    except (FileNotFoundError, ValueError, KeyError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
