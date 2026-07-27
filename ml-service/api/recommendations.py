from fastapi import APIRouter

from models.exercise_recommender import recommend_exercises
from models.food_recommender import recommend_foods
from models.collaborative_filter import (
    recommend_for_user,
    load_interactions,
    load_exercises
)
from models.hybrid_recommender import (
    hybrid_recommendations
)


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

    interactions = load_interactions()

    exercises = load_exercises()


    return recommend_for_user(
        user_id,
        interactions,
        exercises,
        limit
    )



@router.get("/hybrid/{user_id}")
def hybrid_exercise_recommendations(
    user_id: int,
    fitness_goal: str,
    activity_level: str,
    limit: int = 5
):

    preferences = {
        "fitness_goal": fitness_goal,
        "activity_level": activity_level
    }


    return hybrid_recommendations(
        user_id,
        preferences,
        limit
    )