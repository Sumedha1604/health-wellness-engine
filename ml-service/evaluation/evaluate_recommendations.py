"""Evaluate the existing collaborative recommendation pipeline on held-out data."""

import argparse
from pathlib import Path
import sys

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from evaluation.recommendation_metrics import f1_at_k, precision_at_k, recall_at_k
from models.collaborative_filter import (
    load_exercises,
    load_interactions,
    recommend_for_user,
)


DEFAULT_TEST_DATA = BASE_DIR / "data" / "test_interactions.csv"
REQUIRED_COLUMNS = {"user_id", "item_id", "item_type", "interaction"}


def load_test_interactions(path: Path) -> pd.DataFrame:
    """Load and validate the labelled evaluation interactions."""
    interactions = pd.read_csv(path)
    missing_columns = REQUIRED_COLUMNS - set(interactions.columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Evaluation dataset is missing columns: {missing}")
    if interactions.empty:
        raise ValueError("Evaluation dataset must contain at least one interaction")
    if not interactions["interaction"].isin([0, 1]).all():
        raise ValueError("interaction values must be 0 or 1")
    if (interactions["item_type"] != "exercise").any():
        raise ValueError("The existing pipeline currently supports exercise items only")

    return interactions


def evaluate(test_interactions: pd.DataFrame, k: int) -> dict[str, float | int]:
    """Return macro-averaged ranking metrics for users with positive labels."""
    training_interactions = load_interactions()
    exercises = load_exercises()
    scores = []

    for user_id, user_test_data in test_interactions.groupby("user_id"):
        relevant_items = set(
            user_test_data.loc[
                user_test_data["interaction"] == 1,
                "item_id",
            ].astype(int)
        )
        if not relevant_items:
            continue

        # Hold labelled positives out for this user so the evaluation does not
        # train on the answers it is measuring.
        user_training_data = training_interactions[
            ~(
                (training_interactions["user_id"] == user_id)
                & (training_interactions["item_id"].isin(relevant_items))
            )
        ]
        recommendations = recommend_for_user(
            int(user_id),
            user_training_data,
            exercises,
            k,
        )

        scores.append(
            (
                precision_at_k(recommendations, relevant_items, k),
                recall_at_k(recommendations, relevant_items, k),
                f1_at_k(recommendations, relevant_items, k),
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


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate the existing recommendation pipeline."
    )
    parser.add_argument(
        "--data",
        type=Path,
        default=DEFAULT_TEST_DATA,
        help="Labelled interaction CSV (default: data/test_interactions.csv)",
    )
    parser.add_argument("--k", type=int, default=5, help="Recommendation cutoff")
    args = parser.parse_args()

    if args.k <= 0:
        parser.error("--k must be greater than zero")

    results = evaluate(load_test_interactions(args.data), args.k)

    print("Recommendation Evaluation Results")
    print()
    print(f"Precision@{args.k}: {results['precision']:.4f}")
    print(f"Recall@{args.k}: {results['recall']:.4f}")
    print(f"F1@{args.k}: {results['f1']:.4f}")


if __name__ == "__main__":
    main()
