"""Tests for the Phase 6 weighted hybrid recommendation pipeline."""

import unittest

from models.hybrid_recommender import HybridRecommender


class StaticRecommender:
    """Small in-memory model double used to test score orchestration only."""

    def __init__(self, recommendations=None, error=None):
        self.recommendations = recommendations or []
        self.error = error

    def recommend(self, *args, **kwargs):
        if self.error:
            raise self.error
        return self.recommendations


class HybridRecommenderTests(unittest.TestCase):
    def setUp(self):
        self.profile = {
            "fitness_goal": "Improve Endurance",
            "activity_level": "Beginner",
        }

    def test_new_user_uses_content_recommendations(self):
        recommender = HybridRecommender(
            content_recommender=StaticRecommender([
                {"exercise_id": 1, "name": "Slow Jog", "score": 0.9},
            ]),
            collaborative_recommender=StaticRecommender([]),
        )

        recommendations = recommender.recommend(self.profile, user_id=1)

        self.assertEqual(recommendations[0]["exercise_id"], 1)
        self.assertEqual(recommendations[0]["score"], 0.9)
        self.assertEqual(recommendations[0]["source"], "content")
        self.assertTrue(recommendations[0]["reason"])

    def test_existing_user_combines_content_and_collaborative_scores(self):
        recommender = HybridRecommender(
            content_recommender=StaticRecommender([
                {"exercise_id": 1, "name": "Slow Jog", "score": 0.8},
            ]),
            collaborative_recommender=StaticRecommender([
                {"exercise_id": 1, "name": "Slow Jog", "score": 1.0},
            ]),
        )

        recommendations = recommender.recommend(self.profile, user_id=1)

        self.assertEqual(len(recommendations), 1)
        self.assertEqual(recommendations[0]["exercise_id"], 1)
        self.assertEqual(recommendations[0]["name"], "Slow Jog")
        self.assertEqual(recommendations[0]["score"], 0.9)
        self.assertEqual(recommendations[0]["source"], "hybrid")
        self.assertTrue(recommendations[0]["reason"])

    def test_combine_scores_ranks_weighted_results(self):
        recommender = HybridRecommender(
            content_recommender=StaticRecommender(),
            collaborative_recommender=StaticRecommender(),
        )

        recommendations = recommender.combine_scores(
            [
                {"exercise_id": 1, "name": "Jog", "score": 0.8},
                {"exercise_id": 2, "name": "Cycle", "score": 0.7},
            ],
            [
                {"exercise_id": 1, "name": "Jog", "score": 1.0},
            ],
            top_n=2,
        )

        self.assertEqual([item["exercise_id"] for item in recommendations], [1, 2])
        self.assertEqual(recommendations[0]["score"], 0.9)
        self.assertEqual(recommendations[1]["source"], "content")
        self.assertTrue(all(item["reason"] for item in recommendations))

    def test_model_failure_returns_available_recommendations(self):
        recommender = HybridRecommender(
            content_recommender=StaticRecommender(
                error=RuntimeError("Content model unavailable")
            ),
            collaborative_recommender=StaticRecommender([
                {"exercise_id": 3, "name": "Row", "score": 0.75},
            ]),
        )

        recommendations = recommender.recommend(self.profile, user_id=1)

        self.assertEqual(recommendations[0]["exercise_id"], 3)
        self.assertEqual(recommendations[0]["source"], "collaborative")
        self.assertTrue(recommendations[0]["reason"])


if __name__ == "__main__":
    unittest.main()
