"""Content-based exercise recommendations for the standalone ML service."""

from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_PATH = BASE_DIR / "datasets" / "processed" / "exercises.csv"

REQUIRED_COLUMNS = (
    "exercise_id",
    "title",
    "exercise_type",
    "body_part",
    "equipment",
    "difficulty_level",
)


class ContentBasedRecommender:
    """Rank exercises by their similarity to a user's goal and activity level."""

    def __init__(self, dataset_path: Path | str | None = None):
        self.dataset_path = Path(dataset_path or DEFAULT_DATASET_PATH)
        self.exercises: pd.DataFrame | None = None
        self.feature_columns: list[str] = []
        self.encoder: OneHotEncoder | None = None
        self.feature_weights: np.ndarray | None = None
        self.exercise_vectors: np.ndarray | None = None

    def load_exercises(self) -> pd.DataFrame:
        """Load and validate the processed exercise catalogue."""

        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Exercise dataset was not found: {self.dataset_path}"
            )

        exercises = pd.read_csv(self.dataset_path)
        missing_columns = set(REQUIRED_COLUMNS).difference(exercises.columns)

        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise ValueError(f"Exercise dataset is missing required columns: {missing}")

        self.exercises = exercises.copy()
        return self.exercises

    def preprocess_features(self) -> pd.DataFrame:
        """Normalize categorical exercise attributes before one-hot encoding."""

        if self.exercises is None:
            self.load_exercises()

        self.feature_columns = [
            "exercise_type",
            "body_part",
            "equipment",
            "difficulty_level",
        ]

        # Target-muscle data is not present in the current catalogue, but this
        # keeps the model forward-compatible with a richer dataset.
        if "target_muscles" in self.exercises.columns:
            self.feature_columns.append("target_muscles")

        features = self.exercises[self.feature_columns].fillna("").astype(str)
        self.exercises.loc[:, self.feature_columns] = features

        return features

    def build_model(self) -> None:
        """Encode exercise content into vectors used for cosine similarity."""

        features = self.preprocess_features()
        self.encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
        encoded_features = self.encoder.fit_transform(features)
        self.feature_weights = self._feature_weights()
        self.exercise_vectors = encoded_features * self.feature_weights

    def recommend(
        self,
        user_profile: dict[str, Any],
        top_n: int = 5,
    ) -> list[dict[str, Any]]:
        """Return the highest-similarity exercises for a valid user profile."""

        if not isinstance(user_profile, dict):
            raise ValueError("user_profile must be an object")

        fitness_goal = user_profile.get("fitness_goal")
        activity_level = user_profile.get("activity_level")

        if not isinstance(fitness_goal, str) or not fitness_goal.strip():
            raise ValueError("user_profile.fitness_goal is required")

        if not isinstance(activity_level, str) or not activity_level.strip():
            raise ValueError("user_profile.activity_level is required")

        if not isinstance(top_n, int) or top_n < 1:
            raise ValueError("top_n must be a positive integer")

        if self.encoder is None or self.exercise_vectors is None:
            self.build_model()

        profile_features = self._build_profile_features(
            user_profile,
            fitness_goal,
            activity_level,
        )
        profile_vector = self.encoder.transform(profile_features) * self.feature_weights
        scores = cosine_similarity(profile_vector, self.exercise_vectors)[0]

        ranked_indexes = np.argsort(scores)[::-1][:top_n]
        recommendations = []

        for index in ranked_indexes:
            exercise = self.exercises.iloc[int(index)]
            recommendations.append(
                {
                    "exercise_id": int(exercise["exercise_id"]),
                    "name": str(exercise["title"]),
                    "score": round(float(scores[index]), 4),
                    "reason": self._recommendation_reason(
                        exercise,
                        fitness_goal,
                        activity_level,
                        user_profile,
                    ),
                }
            )

        return recommendations

    def _build_profile_features(
        self,
        user_profile: dict[str, Any],
        fitness_goal: str,
        activity_level: str,
    ) -> pd.DataFrame:
        """Translate profile preferences into the same feature space as exercises."""

        profile = {column: "" for column in self.feature_columns}
        profile["exercise_type"] = self._goal_exercise_type(fitness_goal)
        profile["difficulty_level"] = self._activity_difficulty(activity_level)

        for field in ("body_part", "equipment", "target_muscles"):
            value = user_profile.get(field)
            if field in profile and isinstance(value, str):
                profile[field] = value.strip()

        return pd.DataFrame([profile], columns=self.feature_columns)

    def _feature_weights(self) -> np.ndarray:
        """Prioritize explicit user preferences over unspecified content fields."""

        weights = np.ones(len(self.encoder.get_feature_names_out()))
        field_weights = {
            "exercise_type_": 2.0,
            "difficulty_level_": 1.5,
            "body_part_": 1.25,
            "equipment_": 1.0,
            "target_muscles_": 1.25,
        }

        for index, feature_name in enumerate(self.encoder.get_feature_names_out()):
            for prefix, weight in field_weights.items():
                if feature_name.startswith(prefix):
                    weights[index] = weight
                    break

        return weights

    @staticmethod
    def _goal_exercise_type(fitness_goal: str) -> str:
        """Map goal language to an exercise type represented by the dataset."""

        goal = fitness_goal.strip().lower()

        if "endurance" in goal or "weight loss" in goal or "lose weight" in goal:
            return "Cardio"

        if "muscle" in goal or "strength" in goal:
            return "Strength"

        if "flex" in goal or "mobility" in goal:
            return "Stretching"

        return ""

    @staticmethod
    def _activity_difficulty(activity_level: str) -> str:
        """Normalize the backend activity-level contract to dataset difficulty."""

        levels = {
            "beginner": "Beginner",
            "intermediate": "Intermediate",
            "advanced": "Expert",
            "expert": "Expert",
        }

        return levels.get(activity_level.strip().lower(), "")

    def _recommendation_reason(
        self,
        exercise: pd.Series,
        fitness_goal: str,
        activity_level: str,
        user_profile: dict[str, Any],
    ) -> str:
        """Explain the profile attributes that matched this exercise."""
        matches = []
        goal_type = self._goal_exercise_type(fitness_goal)
        exercise_type = str(exercise.get("exercise_type", ""))
        difficulty = self._activity_difficulty(activity_level)

        if goal_type and exercise_type.casefold() == goal_type.casefold():
            matches.append(f"matches your {fitness_goal.strip().lower()} goal")

        if difficulty and str(exercise.get("difficulty_level", "")).casefold() == (
            difficulty.casefold()
        ):
            matches.append(
                f"matches your {activity_level.strip().lower()} difficulty level"
            )

        preferred_body_part = user_profile.get("body_part")
        if isinstance(preferred_body_part, str) and preferred_body_part.strip():
            if str(exercise.get("body_part", "")).casefold() == (
                preferred_body_part.strip().casefold()
            ):
                matches.append(
                    f"targets your preferred {preferred_body_part.strip().lower()} area"
                )

        if matches:
            return "Recommended because it " + " and ".join(matches) + "."

        return "Recommended based on your fitness goal and activity level."
