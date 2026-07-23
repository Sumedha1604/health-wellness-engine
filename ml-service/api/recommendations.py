from fastapi import APIRouter

from models.exercise_recommender import recommend_exercises
from models.food_recommender import recommend_foods
from models.collaborative_filter import recommend_for_user


router = APIRouter()


@router.get("/exercise/{exercise_id}")
def exercise_recommendations(
    exercise_id: int,
    limit: int = 5
):

    return recommend_exercises(
        exercise_id,
        limit
    )


@router.get("/food/{food_id}")
def food_recommendations(
    food_id: int,
    limit: int = 5
):

    return recommend_foods(
        food_id,
        limit
    )


@router.get("/collaborative/{user_id}")
def collaborative_recommendations(
    user_id: int,
    limit: int = 5
):

    return recommend_for_user(
        user_id,
        limit
    )