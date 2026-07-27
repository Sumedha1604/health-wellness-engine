import unittest
from unittest.mock import patch

import numpy as np
import pandas as pd

from models.hybrid_recommender import (
    apply_diversity_penalty,
    build_user_behavior_profile,
    calculate_behavior_score,
    calculate_feedback_score,
    generate_recommendation_reason,
    hybrid_recommendations
)


class HybridRecommenderTests(unittest.TestCase):

    def setUp(self):
        self.exercises = pd.DataFrame([
            {
                "exercise_id": 1,
                "title": "Barbell Bench Press",
                "exercise_type": "Strength",
                "body_part": "Chest",
                "equipment": "Barbell",
                "difficulty_level": "Beginner"
            },
            {
                "exercise_id": 2,
                "title": "Dumbbell Row",
                "exercise_type": "Strength",
                "body_part": "Back",
                "equipment": "Dumbbell",
                "difficulty_level": "Beginner"
            },
            {
                "exercise_id": 3,
                "title": "Cable Fly",
                "exercise_type": "Strength",
                "body_part": "Chest",
                "equipment": "Cable",
                "difficulty_level": "Intermediate"
            }
        ])
        self.interactions = pd.DataFrame([
            {"user_id": 7, "item_id": 1, "interaction": 1},
            {"user_id": 7, "item_id": 1, "interaction": 1}
        ])
        self.preferences = {
            "fitness_goal": "Muscle Gain",
            "activity_level": "Beginner"
        }

    def test_behavior_score_prefers_completed_categories(self):
        profile = build_user_behavior_profile(
            7,
            self.interactions,
            self.exercises
        )

        preferred_score = calculate_behavior_score(
            self.exercises.iloc[0],
            profile
        )
        different_score = calculate_behavior_score(
            self.exercises.iloc[1],
            profile
        )

        self.assertGreater(preferred_score, different_score)

    def test_reason_uses_liked_exercise_signal(self):
        profile = build_user_behavior_profile(
            7,
            self.interactions,
            self.exercises
        )

        reason = generate_recommendation_reason(
            self.exercises.iloc[1],
            self.preferences,
            profile,
            0.8
        )

        self.assertIn("liked similar strength exercises", reason)
        self.assertIn("muscle gain goal", reason)

    def test_feedback_score_rewards_likes_and_penalizes_dislikes(self):
        similarity_matrix = np.array([
            [1.0, 0.8, 0.2],
            [0.8, 1.0, 0.4],
            [0.2, 0.4, 1.0]
        ])
        exercise_index = {1: 0, 2: 1, 3: 2}

        liked_score = calculate_feedback_score(
            2,
            {1: 1},
            similarity_matrix,
            exercise_index
        )
        disliked_score = calculate_feedback_score(
            2,
            {1: -1},
            similarity_matrix,
            exercise_index
        )

        self.assertGreater(liked_score, 0)
        self.assertLess(disliked_score, 0)

    def test_diversity_avoids_repeating_body_part_and_equipment(self):
        recommendations = [
            {"exercise_id": 1, "body_part": "Chest", "equipment": "Barbell", "score": 0.95},
            {"exercise_id": 2, "body_part": "Chest", "equipment": "Barbell", "score": 0.93},
            {"exercise_id": 3, "body_part": "Back", "equipment": "Dumbbell", "score": 0.90}
        ]

        results = apply_diversity_penalty(recommendations, 2)

        self.assertEqual([item["exercise_id"] for item in results], [1, 3])

    @patch("models.hybrid_recommender.recommend_for_user")
    @patch("models.hybrid_recommender.build_exercise_model")
    @patch("models.hybrid_recommender.load_exercises")
    @patch("models.hybrid_recommender.load_interactions")
    def test_hybrid_recommendations_include_personalized_reason(
        self,
        mock_interactions,
        mock_exercises,
        mock_content_model,
        mock_collaborative
    ):
        mock_interactions.return_value = self.interactions
        mock_exercises.return_value = self.exercises
        mock_content_model.return_value = (
            self.exercises,
            np.identity(len(self.exercises))
        )
        mock_collaborative.return_value = [
            {"exercise_id": 2, "score": 0.9}
        ]

        results = hybrid_recommendations(
            7,
            self.preferences,
            limit=2,
            feedback_scores={1: 1}
        )

        self.assertTrue(results)
        self.assertIn("reason", results[0])
        self.assertIn("score", results[0])
        self.assertNotIn(
            "Hybrid recommendation based on user similarity",
            results[0]["reason"]
        )


if __name__ == "__main__":
    unittest.main()
