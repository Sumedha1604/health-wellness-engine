"""Tests for user-based collaborative exercise recommendations."""

import unittest

import pandas as pd

from models.collaborative_recommender import CollaborativeRecommender


class CollaborativeRecommenderTests(unittest.TestCase):
    def setUp(self):
        self.interactions = pd.DataFrame([
            {
                "user_id": 1,
                "exercise_id": 10,
                "action": "COMPLETED",
                "rating": None,
                "completed": True,
            },
            {
                "user_id": 2,
                "exercise_id": 10,
                "action": "COMPLETED",
                "rating": None,
                "completed": True,
            },
            {
                "user_id": 2,
                "exercise_id": 20,
                "action": "FAVORITED",
                "rating": 5,
                "completed": False,
            },
        ])
        self.exercises = pd.DataFrame([
            {"exercise_id": 10, "title": "Exercise One"},
            {"exercise_id": 20, "title": "Exercise Two"},
        ])
        self.recommender = CollaborativeRecommender(
            interaction_loader=lambda: self.interactions,
            exercise_loader=lambda: self.exercises,
        )

    def test_loads_interactions(self):
        interactions = self.recommender.load_interactions()

        self.assertEqual(len(interactions), 3)
        self.assertIn("completed", interactions.columns)

    def test_creates_user_item_matrix(self):
        matrix = self.recommender.create_user_item_matrix()

        self.assertEqual(set(matrix.index), {1, 2})
        self.assertEqual(set(matrix.columns), {10, 20})
        self.assertGreater(matrix.loc[1, 10], 0)

    def test_calculates_user_similarity(self):
        similarities = self.recommender.calculate_similarity()

        self.assertEqual(similarities.shape, (2, 2))
        self.assertGreater(similarities.loc[1, 2], 0)

    def test_recommends_unseen_exercises_from_similar_users(self):
        recommendations = self.recommender.recommend(1, top_n=3)

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["exercise_id"], 20)
        self.assertEqual(recommendations[0]["name"], "Exercise Two")
        self.assertGreater(recommendations[0]["score"], 0)
        self.assertIn("similar exercise preferences", recommendations[0]["reason"])

    def test_returns_empty_for_unknown_user(self):
        self.assertEqual(self.recommender.recommend(999), [])


if __name__ == "__main__":
    unittest.main()
