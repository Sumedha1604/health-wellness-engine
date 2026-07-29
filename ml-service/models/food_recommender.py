"""Nutrition-aware food recommendations with optional user preferences."""

from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "datasets" / "processed" / "foods.csv"
NUTRIENT_COLUMNS = ("caloric_value", "protein", "carbohydrates", "fat")
DEFAULT_SCORE_WEIGHTS = {
    "macro_similarity": 0.20,
    "goal_match": 0.25,
    "diet_compatibility": 0.20,
    "calorie_suitability": 0.15,
    "protein_suitability": 0.15,
    "feedback": 0.05,
}


def load_foods():
    return pd.read_csv(DATASET_PATH).fillna("")


def _normalised_nutrients(foods: pd.DataFrame) -> pd.DataFrame:
    """Robustly scale nutrition values so extreme entries cannot dominate."""
    nutrients = foods.loc[:, NUTRIENT_COLUMNS].astype(float).clip(lower=0)
    upper_bounds = nutrients.quantile(0.95).replace(0, 1.0)
    return nutrients.clip(upper=upper_bounds, axis="columns").div(upper_bounds)


def build_food_model():
    """Return the catalogue and a numeric macro-nutrient similarity matrix."""
    foods = load_foods()
    nutrients = _normalised_nutrients(foods).to_numpy()
    distances = np.linalg.norm(nutrients[:, None, :] - nutrients[None, :, :], axis=2)
    similarity_matrix = 1.0 - np.clip(distances / 2.0, 0.0, 1.0)
    return foods, similarity_matrix


def _closeness(values: pd.Series, target: float | None) -> pd.Series:
    if target is None or float(target) <= 0:
        return pd.Series(np.nan, index=values.index)
    target = float(target)
    return (1.0 - (values.astype(float) - target).abs() / target).clip(0.0, 1.0)


def _minimum_target(values: pd.Series, target: float | None) -> pd.Series:
    if target is None or float(target) <= 0:
        return pd.Series(np.nan, index=values.index)
    return (values.astype(float) / float(target)).clip(0.0, 1.0)


def _preference_signals(foods: pd.DataFrame, preferences: dict | None) -> dict:
    """Calculate normalized nutrition relevance signals for every food."""
    preferences = preferences or {}
    calories = foods["caloric_value"].astype(float)
    protein = foods["protein"].astype(float)
    carbohydrates = foods["carbohydrates"].astype(float)
    fat = foods["fat"].astype(float)
    calorie_score = _closeness(calories, preferences.get("calorie_requirement"))
    protein_score = _minimum_target(protein, preferences.get("protein_requirement"))
    carbohydrate_score = _minimum_target(
        carbohydrates, preferences.get("carbohydrate_requirement")
    )
    low_fat_score = 1.0 - fat.rank(pct=True)
    balanced_score = 1.0 - (
        protein.rank(pct=True) - carbohydrates.rank(pct=True)
    ).abs()

    goal = str(preferences.get("fitness_goal", "")).strip().lower()
    if "weight" in goal and "loss" in goal:
        goal_score = calorie_score * 0.65 + protein_score * 0.25 + low_fat_score * 0.10
    elif "muscle" in goal or "strength" in goal:
        goal_score = protein_score * 0.70 + calorie_score * 0.20 + low_fat_score * 0.10
    elif "endurance" in goal:
        goal_score = carbohydrate_score * 0.65 + calorie_score * 0.25 + protein_score * 0.10
    else:
        goal_score = balanced_score * 0.55 + calorie_score * 0.30 + protein_score * 0.15

    diet_type = str(
        preferences.get("diet_type") or preferences.get("diet_preference") or ""
    ).strip().lower()
    if diet_type in {"low_calorie", "weight_loss"}:
        diet_score = calorie_score * 0.75 + low_fat_score * 0.25
    elif diet_type in {"high_protein", "muscle_gain"}:
        diet_score = protein_score * 0.80 + low_fat_score * 0.20
    elif diet_type in {"high_carb", "endurance"}:
        diet_score = carbohydrate_score * 0.80 + low_fat_score * 0.20
    else:
        diet_score = balanced_score

    return {
        "goal_match": goal_score.fillna(0.5).clip(0.0, 1.0),
        "diet_compatibility": diet_score.fillna(0.5).clip(0.0, 1.0),
        "calorie_suitability": calorie_score.fillna(0.5),
        "protein_suitability": protein_score.fillna(0.5),
    }


def _validated_weights(score_weights: dict | None) -> dict:
    weights = {**DEFAULT_SCORE_WEIGHTS, **(score_weights or {})}
    if any(float(weight) < 0 for weight in weights.values()):
        raise ValueError("Food recommendation weights must be non-negative")
    if sum(float(weight) for weight in weights.values()) <= 0:
        raise ValueError("At least one food recommendation weight must be positive")
    return weights


def recommend_foods(
    food_id,
    limit=5,
    feedback_scores=None,
    user_preferences=None,
    score_weights=None,
):
    """Rank foods by normalized similarity and optional preference relevance.

    Existing callers may continue passing only food_id, limit, and feedback.
    The response keys and endpoint contracts remain unchanged.
    """
    foods, similarity_matrix = build_food_model()
    matches = foods.index[foods["food_id"] == food_id]
    if len(matches) == 0:
        return []
    if not isinstance(limit, int) or limit < 1:
        raise ValueError("limit must be a positive integer")

    anchor_index = int(matches[0])
    weights = _validated_weights(score_weights)
    signals = _preference_signals(foods, user_preferences)
    feedback_scores = feedback_scores or {}
    food_index = {
        int(food.food_id): index for index, food in foods.iterrows()
    }

    feedback = np.zeros(len(foods), dtype=float)
    for feedback_food_id, feedback_score in feedback_scores.items():
        feedback_index = food_index.get(int(feedback_food_id))
        if feedback_index is not None:
            feedback += similarity_matrix[:, feedback_index] * float(feedback_score)
    # Normalize signed feedback to the same 0..1 range as every other signal.
    if feedback_scores:
        maximum_feedback = max(float(np.max(np.abs(feedback))), 1.0)
        feedback = np.clip((feedback / maximum_feedback + 1.0) / 2.0, 0.0, 1.0)
    else:
        feedback.fill(0.5)

    weighted_total = (
        similarity_matrix[anchor_index] * weights["macro_similarity"]
        + signals["goal_match"].to_numpy() * weights["goal_match"]
        + signals["diet_compatibility"].to_numpy()
        * weights["diet_compatibility"]
        + signals["calorie_suitability"].to_numpy()
        * weights["calorie_suitability"]
        + signals["protein_suitability"].to_numpy()
        * weights["protein_suitability"]
        + feedback * weights["feedback"]
    ) / sum(weights.values())
    weighted_total[anchor_index] = -1.0

    ranked_indexes = sorted(
        range(len(foods)),
        key=lambda index: (-float(weighted_total[index]), int(foods.iloc[index]["food_id"])),
    )[:limit]

    recommendations = []
    for index in ranked_indexes:
        food = foods.iloc[index]
        recommendations.append(
            {
                "food_id": int(food["food_id"]),
                "food_name": food["food_name"],
                "caloric_value": float(food["caloric_value"]),
                "protein": float(food["protein"]),
                "carbohydrates": float(food["carbohydrates"]),
                "fat": float(food["fat"]),
                "similarity_score": round(float(weighted_total[index]), 4),
                "reason": (
                    "Recommended for its macro similarity, calorie suitability, "
                    "protein content, fitness goal, and diet compatibility."
                    if user_preferences
                    else "Similar food based on normalized nutrition profile"
                ),
            }
        )
    return recommendations
