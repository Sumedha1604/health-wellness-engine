"""Generate a reproducible synthetic benchmark from the processed catalogues."""

from pathlib import Path
import sys

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

EXERCISES_PATH = BASE_DIR / "datasets" / "processed" / "exercises.csv"
FOODS_PATH = BASE_DIR / "datasets" / "processed" / "foods.csv"
OUTPUT_PATH = BASE_DIR / "data" / "test_interactions.csv"
USERS_PER_GOAL = 6
POSITIVE_ITEMS_PER_TYPE = 10
NEGATIVE_ITEMS_PER_TYPE = 10

GOAL_PROFILES = (
    ("Weight Loss", ("Cardio", "Plyometrics"), "low_calorie", 150, 15, 20),
    (
        "Muscle Gain",
        ("Strength", "Powerlifting", "Olympic Weightlifting"),
        "high_protein",
        450,
        30,
        35,
    ),
    ("Improve Endurance", ("Cardio", "Plyometrics"), "high_carb", 400, 15, 60),
    ("General Fitness", ("Strength", "Cardio", "Stretching"), "balanced", 300, 20, 35),
)
ACTIVITY_LEVELS = ("Beginner", "Intermediate")
BODY_PARTS = ("Abdominals", "Chest", "Back", "Quadriceps", "Shoulders", "Glutes")
EQUIPMENT = ("Body Only", "Dumbbell", "Barbell", "Cable", "Machine", "Bands")


def synthetic_profiles() -> dict[int, dict]:
    """Return stable, varied profiles used by generation and evaluation."""
    profiles = {}
    user_id = 10_001

    for (
        fitness_goal,
        exercise_types,
        diet_type,
        calorie_requirement,
        protein_requirement,
        carbohydrate_requirement,
    ) in GOAL_PROFILES:
        for variant in range(USERS_PER_GOAL):
            profiles[user_id] = {
                "fitness_goal": fitness_goal,
                "activity_level": ACTIVITY_LEVELS[variant % len(ACTIVITY_LEVELS)],
                "body_part": BODY_PARTS[variant % len(BODY_PARTS)],
                "equipment": EQUIPMENT[variant % len(EQUIPMENT)],
                "exercise_types": exercise_types,
                "preferred_exercise_type": (
                    "Strength"
                    if fitness_goal == "Muscle Gain"
                    else "Cardio"
                    if fitness_goal in {"Weight Loss", "Improve Endurance"}
                    else ""
                ),
                "diet_type": diet_type,
                "diet_preference": diet_type,
                "calorie_requirement": calorie_requirement,
                "protein_requirement": protein_requirement,
                "carbohydrate_requirement": carbohydrate_requirement,
            }
            user_id += 1

    return profiles


def _exercise_scores(exercises: pd.DataFrame, profile: dict) -> pd.Series:
    """Score catalogue items using profile relevance, independent of the model."""
    if profile["preferred_exercise_type"]:
        type_score = exercises["exercise_type"].eq(
            profile["preferred_exercise_type"]
        ).astype(int) * 4
    else:
        type_score = exercises["exercise_type"].isin(
            profile["exercise_types"]
        ).astype(int)
    difficulty_match = exercises["difficulty_level"].eq(profile["activity_level"])
    body_match = exercises["body_part"].eq(profile["body_part"])
    equipment_match = exercises["equipment"].eq(profile["equipment"])
    return (
        type_score
        + difficulty_match.astype(int) * 2
        + body_match.astype(int) * 2
        + equipment_match.astype(int)
    )


def _food_scores(foods: pd.DataFrame, profile: dict) -> pd.Series:
    """Score goal, diet, calorie, protein, and macro suitability for labels."""
    calories = foods["caloric_value"].astype(float)
    protein = foods["protein"].astype(float)
    carbohydrates = foods["carbohydrates"].astype(float)
    fat = foods["fat"].rank(pct=True)
    calorie_match = (
        1 - (calories - profile["calorie_requirement"]).abs()
        / profile["calorie_requirement"]
    ).clip(0, 1)
    protein_match = (protein / profile["protein_requirement"]).clip(0, 1)
    carbohydrate_match = (
        carbohydrates / profile["carbohydrate_requirement"]
    ).clip(0, 1)
    low_fat = 1 - fat

    if profile["diet_type"] == "low_calorie":
        return calorie_match * 0.65 + protein_match * 0.25 + low_fat * 0.10
    if profile["diet_type"] == "high_protein":
        return protein_match * 0.70 + calorie_match * 0.20 + low_fat * 0.10
    if profile["diet_type"] == "high_carb":
        return carbohydrate_match * 0.65 + calorie_match * 0.25 + protein_match * 0.10

    # General fitness: favour moderate energy and balanced macronutrients.
    calorie_balance = calorie_match
    macro_balance = 1 - (
        protein.rank(pct=True) - carbohydrates.rank(pct=True)
    ).abs()
    return calorie_balance * 0.6 + macro_balance * 0.4


def food_anchor_id(foods: pd.DataFrame, profile: dict) -> int:
    """Select a relevant seed food that is not included in evaluation labels."""
    scores = _food_scores(foods, profile)
    return int(foods.loc[scores.sort_values(ascending=False).index[0], "food_id"])


def _label_items(
    user_id: int,
    item_ids: pd.Series,
    scores: pd.Series,
    item_type: str,
    exclude_ids: set[int] | None = None,
) -> list[dict]:
    """Choose high-relevance positives and low-relevance negatives."""
    candidates = pd.DataFrame({"item_id": item_ids.astype(int), "score": scores})
    if exclude_ids:
        candidates = candidates[~candidates["item_id"].isin(exclude_ids)]

    positives = candidates.sort_values(
        ["score", "item_id"], ascending=[False, True]
    ).head(POSITIVE_ITEMS_PER_TYPE)
    negatives = candidates.sort_values(
        ["score", "item_id"], ascending=[True, True]
    ).head(NEGATIVE_ITEMS_PER_TYPE)

    return [
        {
            "user_id": user_id,
            "item_id": int(row.item_id),
            "item_type": item_type,
            "interaction": interaction,
        }
        for interaction, labelled_items in ((1, positives), (0, negatives))
        for row in labelled_items.itertuples(index=False)
    ]


def generate_dataset() -> pd.DataFrame:
    exercises = pd.read_csv(EXERCISES_PATH)
    foods = pd.read_csv(FOODS_PATH)
    records = []

    for user_id, profile in synthetic_profiles().items():
        records.extend(
            _label_items(
                user_id,
                exercises["exercise_id"],
                _exercise_scores(exercises, profile),
                "exercise",
            )
        )
        food_scores = _food_scores(foods, profile)
        records.extend(
            _label_items(
                user_id,
                foods["food_id"],
                food_scores,
                "food",
                {food_anchor_id(foods, profile)},
            )
        )

    return pd.DataFrame(
        records,
        columns=["user_id", "item_id", "item_type", "interaction"],
    )


def main() -> None:
    dataset = generate_dataset()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(OUTPUT_PATH, index=False)

    print("Recommendation evaluation dataset generated")
    print("-------------------------------------------")
    print(f"Output: {OUTPUT_PATH.relative_to(BASE_DIR)}")
    print(f"Dataset size: {len(dataset)}")
    print(f"Synthetic users: {dataset['user_id'].nunique()}")
    print(f"Positive interactions: {(dataset['interaction'] == 1).sum()}")
    print(f"Negative interactions: {(dataset['interaction'] == 0).sum()}")


if __name__ == "__main__":
    main()
