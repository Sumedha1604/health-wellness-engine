"""Tests for the offline recommendation-model training pipeline."""

import pickle
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from training.train_recommendation_model import (
    DEFAULT_DATASET_PATH,
    load_interactions,
    run_training,
    train_recommendation_model,
)


class RecommendationTrainingPipelineTests(unittest.TestCase):
    def test_loads_sample_interaction_dataset(self):
        interactions = load_interactions(DEFAULT_DATASET_PATH)

        self.assertFalse(interactions.empty)
        self.assertEqual(
            set(interactions.columns),
            {"user_id", "exercise_id", "rating", "completed", "timestamp"},
        )

    def test_training_creates_similarity_artifact(self):
        artifact = train_recommendation_model(load_interactions(DEFAULT_DATASET_PATH))

        self.assertEqual(artifact["model_type"], "user_cosine_similarity")
        self.assertEqual(artifact["user_item_matrix"].shape, (3, 3))
        self.assertEqual(artifact["similarity_matrix"].shape, (3, 3))

    def test_training_saves_model_file(self):
        with TemporaryDirectory() as temporary_directory:
            model_path = Path(temporary_directory) / "recommendation_model.pkl"
            saved_path = run_training(DEFAULT_DATASET_PATH, model_path)

            self.assertEqual(saved_path, model_path)
            self.assertTrue(model_path.exists())

            with model_path.open("rb") as model_file:
                artifact = pickle.load(model_file)

            self.assertEqual(artifact["model_type"], "user_cosine_similarity")
