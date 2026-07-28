"""Tests for deep wellness-category model preparation and safe inference."""

import unittest

import numpy as np
import pandas as pd

from models.deep_recommender import DeepRecommendationModel, tf


def wellness_dataset() -> pd.DataFrame:
    """Return representative feature rows solely for preprocessing tests."""

    rows = []
    for index, category in enumerate(["Cardio", "Strength"]):
        row = {
            "gender": "Female" if index == 0 else "Male",
            "fitness_goal": "Improve Endurance" if index == 0 else "Muscle Gain",
            "activity_level": "Beginner",
            "height_cm": 165 + index,
            "weight_kg": 60 + index,
            "workout_count": 3 + index,
            "workout_minutes": 90 + index,
            "calories_burned": 500 + index,
            "nutrition_calories": 1800 + index,
            "nutrition_protein": 90 + index,
            "nutrition_carbohydrates": 180 + index,
            "nutrition_fat": 50 + index,
            "water_ml": 2200 + index,
            "interaction_count": 4 + index,
            "completed_interactions": 2 + index,
            "target_category": category,
        }
        rows.append(row)
    return pd.DataFrame(rows)


class DeepRecommendationModelTests(unittest.TestCase):
    def test_prepare_dataset_encodes_wellness_features(self):
        model = DeepRecommendationModel(minimum_training_samples=2)

        features, labels = model.prepare_dataset(wellness_dataset())

        self.assertEqual(features.shape[0], 2)
        self.assertGreater(features.shape[1], len(model.numeric_features))
        self.assertEqual(set(labels), {0, 1})

    def test_prediction_returns_none_without_a_saved_model(self):
        model = DeepRecommendationModel(
            model_path="/tmp/does-not-exist.keras",
            metadata_path="/tmp/does-not-exist.json",
        )

        self.assertIsNone(model.predict({
            "fitness_goal": "Improve Endurance",
            "activity_level": "Beginner",
            "weight": 70,
        }))

    def test_invalid_profile_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "fitness_goal"):
            DeepRecommendationModel().predict({"activity_level": "Beginner"})

    @unittest.skipUnless(tf is not None, "TensorFlow is not installed")
    def test_model_creation_produces_category_probabilities(self):
        model = DeepRecommendationModel()
        keras_model = model.build_model(input_size=3, output_size=2)

        probabilities = keras_model.predict(np.zeros((1, 3)), verbose=0)

        self.assertEqual(probabilities.shape, (1, 2))
        self.assertAlmostEqual(float(probabilities[0].sum()), 1.0, places=5)


if __name__ == "__main__":
    unittest.main()
