"""Evaluate saved recommendation results against recorded user interactions.

The evaluator is intentionally offline: it does not call the recommendation API
or change any model behaviour. It accepts recommendation results saved as JSON
and compares them with positive interactions exported as CSV.
"""

import argparse
import csv
import json
from pathlib import Path

from evaluation.recommendation_metrics import f1_at_k, precision_at_k, recall_at_k


def load_recommendation_results(file_path):
    """Load a mapping of user ids to ordered recommendation lists from JSON."""
    with Path(file_path).open(encoding="utf-8") as recommendation_file:
        payload = json.load(recommendation_file)

    if isinstance(payload, dict) and "results" in payload:
        payload = payload["results"]

    if isinstance(payload, dict):
        return {str(user_id): items for user_id, items in payload.items()}

    if not isinstance(payload, list):
        raise ValueError("Recommendation results must be a JSON object or list.")

    results = {}
    for record in payload:
        if not isinstance(record, dict):
            raise ValueError("Each recommendation result must be an object.")

        user_id = record.get("user_id")
        recommendations = record.get("recommendations")
        if user_id is None or not isinstance(recommendations, list):
            raise ValueError(
                "Each result must contain user_id and a recommendations list."
            )
        results[str(user_id)] = recommendations

    return results


def load_actual_interactions(file_path):
    """Load positive user-item interactions from a CSV export."""
    actual_items = {}

    with Path(file_path).open(newline="", encoding="utf-8") as interaction_file:
        for row in csv.DictReader(interaction_file):
            user_id = row.get("user_id")
            item_id = row.get("item_id") or row.get("exercise_id")
            interaction = row.get("interaction")

            if not user_id or not item_id:
                continue
            if interaction is not None and float(interaction or 0) <= 0:
                continue

            actual_items.setdefault(str(user_id), set()).add(str(item_id))

    return actual_items


def evaluate(recommendation_results, actual_interactions, k):
    """Calculate macro-averaged Precision, Recall, and F1 at K."""
    scores = []
    for user_id, recommendations in recommendation_results.items():
        actual_items = actual_interactions.get(user_id, set())
        scores.append(
            (
                precision_at_k(recommendations, actual_items, k),
                recall_at_k(recommendations, actual_items, k),
                f1_at_k(recommendations, actual_items, k),
            )
        )

    if not scores:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0, "users": 0}

    return {
        "precision": sum(score[0] for score in scores) / len(scores),
        "recall": sum(score[1] for score in scores) / len(scores),
        "f1": sum(score[2] for score in scores) / len(scores),
        "users": len(scores),
    }


def main():
    """Parse evaluator inputs and print the aggregate offline metrics."""
    parser = argparse.ArgumentParser(description="Evaluate recommendation results.")
    parser.add_argument(
        "--recommendations",
        required=True,
        help="Path to JSON recommendation results grouped by user.",
    )
    parser.add_argument(
        "--interactions",
        default="datasets/processed/interactions.csv",
        help="Path to the CSV export of actual positive interactions.",
    )
    parser.add_argument("--k", type=int, default=5, help="Recommendation cutoff.")
    args = parser.parse_args()

    if args.k <= 0:
        parser.error("--k must be greater than zero.")

    recommendation_results = load_recommendation_results(args.recommendations)
    actual_interactions = load_actual_interactions(args.interactions)
    results = evaluate(recommendation_results, actual_interactions, args.k)

    print("Evaluated users: {}".format(results["users"]))
    print("Precision@{}: {:.4f}".format(args.k, results["precision"]))
    print("Recall@{}: {:.4f}".format(args.k, results["recall"]))
    print("F1@{}: {:.4f}".format(args.k, results["f1"]))


if __name__ == "__main__":
    main()
