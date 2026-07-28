"""Unit tests for standard top-K recommendation metrics."""

import unittest

from evaluation.recommendation_metrics import f1_at_k, precision_at_k, recall_at_k


class RecommendationMetricsTests(unittest.TestCase):
    def test_metrics_calculate_expected_values(self):
        recommendations = [1, 2, 3]
        actual_items = [1, 3, 4]

        self.assertEqual(precision_at_k(recommendations, actual_items, 2), 0.5)
        self.assertAlmostEqual(recall_at_k(recommendations, actual_items, 2), 1 / 3)
        self.assertAlmostEqual(f1_at_k(recommendations, actual_items, 2), 0.4)

    def test_metrics_handle_empty_inputs(self):
        self.assertEqual(precision_at_k([], [1], 5), 0.0)
        self.assertEqual(recall_at_k([1], [], 5), 0.0)
        self.assertEqual(f1_at_k([], [], 5), 0.0)

    def test_metrics_respect_different_k_values(self):
        recommendations = [1, 2, 3, 4]
        actual_items = [1, 3]

        self.assertEqual(precision_at_k(recommendations, actual_items, 1), 1.0)
        self.assertEqual(recall_at_k(recommendations, actual_items, 1), 0.5)
        self.assertAlmostEqual(f1_at_k(recommendations, actual_items, 1), 2 / 3)
        self.assertAlmostEqual(f1_at_k(recommendations, actual_items, 3), 0.8)
        self.assertEqual(f1_at_k(recommendations, actual_items, 0), 0.0)
