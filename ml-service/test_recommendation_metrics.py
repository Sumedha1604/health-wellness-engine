import unittest

from evaluation.recommendation_metrics import (
    diversity_score,
    evaluate_recommendations,
    precision_at_k,
    recall_at_k,
    user_satisfaction_score
)


class RecommendationMetricsTests(unittest.TestCase):

    def setUp(self):
        self.recommendations = [
            {"exercise_id": 1, "body_part": "Chest", "equipment": "Barbell"},
            {"exercise_id": 2, "body_part": "Back", "equipment": "Dumbbell"},
            {"exercise_id": 3, "body_part": "Chest", "equipment": "Cable"}
        ]

    def test_precision_and_recall_at_k(self):
        recommended_ids = [1, 2, 3]
        relevant_ids = {1, 3, 4}

        self.assertEqual(
            precision_at_k(recommended_ids, relevant_ids, 2),
            0.5
        )
        self.assertEqual(
            recall_at_k(recommended_ids, relevant_ids, 2),
            1 / 3
        )

    def test_diversity_considers_body_parts_and_equipment(self):
        self.assertEqual(diversity_score(self.recommendations), 0.833)

    def test_satisfaction_normalizes_feedback(self):
        self.assertEqual(user_satisfaction_score([1, 1, -1]), 0.667)
        self.assertEqual(user_satisfaction_score([]), 0.5)

    def test_combined_evaluation_report(self):
        report = evaluate_recommendations(
            [1, 2, 3],
            {1, 3},
            self.recommendations,
            {1: 1, 2: -1},
            2
        )

        self.assertEqual(report["precision_at_k"], 0.5)
        self.assertEqual(report["recall_at_k"], 0.5)
        self.assertIn("diversity_score", report)
        self.assertEqual(report["user_satisfaction_score"], 0.5)


if __name__ == "__main__":
    unittest.main()
