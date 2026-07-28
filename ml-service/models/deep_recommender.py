"""TensorFlow model for predicting a user's preferred workout category.

The model is intentionally optional at runtime.  A deployed service can serve
the existing content recommendations until enough real user interaction data is
available to train and save this model.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Callable

import mysql.connector
import numpy as np
import pandas as pd
from dotenv import load_dotenv

try:
    import tensorflow as tf
except ImportError:  # TensorFlow is installed by the ML-service requirements.
    tf = None


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_DIRECTORY = Path(__file__).resolve().parent / "saved"
DEFAULT_MODEL_PATH = MODEL_DIRECTORY / "deep_recommender.keras"
DEFAULT_METADATA_PATH = MODEL_DIRECTORY / "deep_recommender.metadata.json"

load_dotenv(PROJECT_ROOT / ".env")


class DeepRecommendationModel:
    """Classify a wellness profile into a workout category with Keras."""

    categorical_features = ("gender", "fitness_goal", "activity_level")
    numeric_features = (
        "height_cm",
        "weight_kg",
        "workout_count",
        "workout_minutes",
        "calories_burned",
        "nutrition_calories",
        "nutrition_protein",
        "nutrition_carbohydrates",
        "nutrition_fat",
        "water_ml",
        "interaction_count",
        "completed_interactions",
    )

    def __init__(
        self,
        dataset_loader: Callable[[], pd.DataFrame] | None = None,
        model_path: Path | str | None = None,
        metadata_path: Path | str | None = None,
        minimum_training_samples: int = 10,
    ):
        self.dataset_loader = dataset_loader
        self.model_path = Path(model_path or DEFAULT_MODEL_PATH)
        self.metadata_path = Path(metadata_path or DEFAULT_METADATA_PATH)
        self.minimum_training_samples = minimum_training_samples
        self.model = None
        self.feature_columns: list[str] = []
        self.feature_means: dict[str, float] = {}
        self.categories: list[str] = []

    def prepare_dataset(
        self,
        dataset: pd.DataFrame | None = None,
    ) -> tuple[np.ndarray, np.ndarray]:
        """Turn real wellness rows into numeric training features and labels."""

        dataset = dataset.copy() if dataset is not None else self.load_training_data()
        required_columns = set(self.categorical_features + self.numeric_features)
        required_columns.add("target_category")
        missing_columns = required_columns.difference(dataset.columns)

        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise ValueError(f"Deep-learning dataset is missing required columns: {missing}")

        dataset = dataset.dropna(subset=["target_category"])
        if dataset.empty:
            self.feature_columns = []
            self.feature_means = {}
            self.categories = []
            return np.empty((0, 0)), np.empty((0,), dtype=np.int64)

        features = self._prepare_features(dataset, fit=True)
        self.categories = sorted(dataset["target_category"].astype(str).unique())
        category_index = {category: index for index, category in enumerate(self.categories)}
        labels = dataset["target_category"].astype(str).map(category_index).to_numpy()

        return features.to_numpy(dtype=np.float32), labels.astype(np.int64)

    def build_model(self, input_size: int, output_size: int):
        """Build the dense Keras classifier used for category prediction."""

        if tf is None:
            raise RuntimeError("TensorFlow is not installed for the ML service")

        if input_size < 1 or output_size < 2:
            raise ValueError("Deep model requires features and at least two categories")

        self.model = tf.keras.Sequential([
            tf.keras.layers.Input(shape=(input_size,)),
            tf.keras.layers.Dense(32, activation="relu"),
            tf.keras.layers.Dense(16, activation="relu"),
            tf.keras.layers.Dense(output_size, activation="softmax"),
        ])
        self.model.compile(
            optimizer="adam",
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )
        return self.model

    def train(
        self,
        dataset: pd.DataFrame | None = None,
        epochs: int = 20,
        batch_size: int = 16,
    ) -> bool:
        """Train and save a model only when real data is sufficient."""

        if tf is None:
            return False

        features, labels = self.prepare_dataset(dataset)
        if (
            len(labels) < self.minimum_training_samples
            or len(self.categories) < 2
        ):
            return False

        self.build_model(features.shape[1], len(self.categories))
        self.model.fit(
            features,
            labels,
            epochs=epochs,
            batch_size=min(batch_size, len(labels)),
            verbose=0,
        )
        self.save_model()
        return True

    def predict(self, user_profile: dict) -> dict | None:
        """Return a workout-category prediction from a saved trained model."""

        self._validate_profile(user_profile)
        if not self._load_saved_model():
            return None

        profile_frame = pd.DataFrame([self._profile_row(user_profile)])
        features = self._prepare_features(profile_frame, fit=False)
        probabilities = self.model.predict(
            features.to_numpy(dtype=np.float32),
            verbose=0,
        )[0]
        category_index = int(np.argmax(probabilities))

        return {
            "workout_category": self.categories[category_index],
            "score": round(float(probabilities[category_index]), 4),
        }

    def load_training_data(self) -> pd.DataFrame:
        """Load wellness aggregates and real positive-interaction categories."""

        if self.dataset_loader:
            return self.dataset_loader().copy()

        profiles = self._read_database(
            """
            SELECT
                u.user_id,
                u.gender,
                p.fitness_goal,
                p.activity_level,
                p.height_cm,
                p.weight_kg,
                COALESCE(exercise_summary.workout_count, 0) AS workout_count,
                COALESCE(exercise_summary.workout_minutes, 0) AS workout_minutes,
                COALESCE(exercise_summary.calories_burned, 0) AS calories_burned,
                COALESCE(nutrition_summary.nutrition_calories, 0) AS nutrition_calories,
                COALESCE(nutrition_summary.nutrition_protein, 0) AS nutrition_protein,
                COALESCE(nutrition_summary.nutrition_carbohydrates, 0) AS nutrition_carbohydrates,
                COALESCE(nutrition_summary.nutrition_fat, 0) AS nutrition_fat,
                COALESCE(water_summary.water_ml, 0) AS water_ml,
                COALESCE(interaction_summary.interaction_count, 0) AS interaction_count,
                COALESCE(interaction_summary.completed_interactions, 0) AS completed_interactions
            FROM users u
            INNER JOIN preferences p ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS workout_count,
                    SUM(duration_minutes) AS workout_minutes,
                    SUM(calories_burned) AS calories_burned
                FROM exercise_logs
                GROUP BY user_id
            ) exercise_summary ON exercise_summary.user_id = u.user_id
            LEFT JOIN (
                SELECT nl.user_id,
                    SUM(f.caloric_value * nl.quantity) AS nutrition_calories,
                    SUM(f.protein * nl.quantity) AS nutrition_protein,
                    SUM(f.carbohydrates * nl.quantity) AS nutrition_carbohydrates,
                    SUM(f.fat * nl.quantity) AS nutrition_fat
                FROM nutrition_logs nl
                INNER JOIN foods f ON f.food_id = nl.food_id
                GROUP BY nl.user_id
            ) nutrition_summary ON nutrition_summary.user_id = u.user_id
            LEFT JOIN (
                SELECT user_id, SUM(amount_ml) AS water_ml
                FROM water_logs
                GROUP BY user_id
            ) water_summary ON water_summary.user_id = u.user_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS interaction_count,
                    SUM(completed) AS completed_interactions
                FROM recommendation_interactions
                GROUP BY user_id
            ) interaction_summary ON interaction_summary.user_id = u.user_id
            """
        )
        categories = self._read_database(
            """
            SELECT ri.user_id, e.exercise_type AS target_category, COUNT(*) AS strength
            FROM recommendation_interactions ri
            INNER JOIN exercises e ON e.exercise_id = ri.exercise_id
            WHERE ri.action IN ('COMPLETED', 'FAVORITED')
               OR (ri.action = 'RATED' AND ri.rating >= 4)
            GROUP BY ri.user_id, e.exercise_type
            """
        )

        if profiles.empty or categories.empty:
            return pd.DataFrame(columns=[
                "target_category", *self.categorical_features, *self.numeric_features,
            ])

        top_categories = (
            categories.sort_values(["user_id", "strength"], ascending=[True, False])
            .drop_duplicates("user_id")
            [["user_id", "target_category"]]
        )
        return profiles.merge(top_categories, on="user_id", how="inner")

    def save_model(self) -> None:
        """Persist the Keras model plus preprocessing metadata for inference."""

        if self.model is None:
            raise RuntimeError("No deep model has been trained")

        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        self.model.save(self.model_path)
        self.metadata_path.write_text(json.dumps({
            "feature_columns": self.feature_columns,
            "feature_means": self.feature_means,
            "categories": self.categories,
        }))

    def _load_saved_model(self) -> bool:
        if self.model is not None:
            return True

        if tf is None or not self.model_path.exists() or not self.metadata_path.exists():
            return False

        metadata = json.loads(self.metadata_path.read_text())
        self.feature_columns = metadata["feature_columns"]
        self.feature_means = metadata["feature_means"]
        self.categories = metadata["categories"]
        self.model = tf.keras.models.load_model(self.model_path)
        return True

    def _prepare_features(self, dataset: pd.DataFrame, fit: bool) -> pd.DataFrame:
        categorical = dataset.reindex(columns=self.categorical_features, fill_value="")
        categorical = categorical.fillna("").astype(str)
        encoded = pd.get_dummies(categorical, prefix=self.categorical_features, dtype=float)

        numeric = dataset.reindex(columns=self.numeric_features, fill_value=0)
        numeric = numeric.apply(pd.to_numeric, errors="coerce")
        if fit:
            self.feature_means = {
                column: float(numeric[column].mean()) if numeric[column].notna().any() else 0.0
                for column in self.numeric_features
            }
        numeric = numeric.fillna(self.feature_means).fillna(0.0)

        features = pd.concat([numeric, encoded], axis=1)
        if fit:
            self.feature_columns = list(features.columns)
        else:
            features = features.reindex(columns=self.feature_columns, fill_value=0.0)

        return features

    def _profile_row(self, user_profile: dict) -> dict:
        return {
            "gender": user_profile.get("gender", ""),
            "fitness_goal": user_profile["fitness_goal"],
            "activity_level": user_profile["activity_level"],
            "height_cm": user_profile.get("height_cm", 0),
            "weight_kg": user_profile.get("weight", user_profile.get("weight_kg", 0)),
            "workout_count": user_profile.get("workout_count", 0),
            "workout_minutes": user_profile.get("workout_minutes", 0),
            "calories_burned": user_profile.get("calories_burned", 0),
            "nutrition_calories": user_profile.get("nutrition_calories", 0),
            "nutrition_protein": user_profile.get("nutrition_protein", 0),
            "nutrition_carbohydrates": user_profile.get("nutrition_carbohydrates", 0),
            "nutrition_fat": user_profile.get("nutrition_fat", 0),
            "water_ml": user_profile.get("water_ml", 0),
            "interaction_count": user_profile.get("interaction_count", 0),
            "completed_interactions": user_profile.get("completed_interactions", 0),
        }

    @staticmethod
    def _validate_profile(user_profile: dict) -> None:
        if not isinstance(user_profile, dict):
            raise ValueError("user_profile must be an object")

        for field in ("fitness_goal", "activity_level"):
            value = user_profile.get(field)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"user_profile.{field} is required")

        weight = user_profile.get("weight", user_profile.get("weight_kg"))
        if weight is not None:
            try:
                if float(weight) <= 0:
                    raise ValueError
            except (TypeError, ValueError) as error:
                raise ValueError("user_profile.weight must be a positive number") from error

    @staticmethod
    def _read_database(query: str) -> pd.DataFrame:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
        )
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query)
            return pd.DataFrame(cursor.fetchall(), columns=cursor.column_names)
        finally:
            if "cursor" in locals():
                cursor.close()
            connection.close()
