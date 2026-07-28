"""Tests for the Phase 2 content-based recommendation endpoint and model."""

import unittest

from models.content_recommender import ContentBasedRecommender


class ContentBasedRecommenderTests(unittest.TestCase):
    def setUp(self):
        self.recommender = ContentBasedRecommender()

    def test_model_loads_exercise_data(self):
        exercises = self.recommender.load_exercises()

        self.assertFalse(exercises.empty)
        self.assertIn("exercise_id", exercises.columns)
        self.assertIn("difficulty_level", exercises.columns)

    def test_recommendation_returns_ranked_exercises(self):
        recommendations = self.recommender.recommend(
            {
                "fitness_goal": "Improve Endurance",
                "activity_level": "Beginner",
            },
            top_n=3,
        )

        self.assertEqual(len(recommendations), 3)
        self.assertTrue(all("exercise_id" in item for item in recommendations))
        self.assertTrue(all("name" in item for item in recommendations))
        self.assertTrue(all(0 <= item["score"] <= 1 for item in recommendations))

        recommended_ids = [item["exercise_id"] for item in recommendations]
        recommended_types = self.recommender.exercises.loc[
            self.recommender.exercises["exercise_id"].isin(recommended_ids),
            "exercise_type",
        ]
        self.assertTrue((recommended_types == "Cardio").all())

    def test_invalid_profile_is_handled(self):
        with self.assertRaisesRegex(ValueError, "fitness_goal"):
            self.recommender.recommend({"activity_level": "Beginner"})


if __name__ == "__main__":
    unittest.main()
