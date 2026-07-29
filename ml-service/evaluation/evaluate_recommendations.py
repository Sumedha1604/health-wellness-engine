"""Evaluate existing exercise and food recommenders on synthetic profiles."""

import argparse
from pathlib import Path
import sys

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from evaluation.generate_test_data import food_anchor_id, synthetic_profiles
from evaluation.recommendation_metrics import (
    f1_at_k,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
)
from models.content_recommender import ContentBasedRecommender
from models.food_recommender import load_foods, recommend_foods
from models.hybrid_recommender import HybridRecommender


DEFAULT_TEST_DATA = BASE_DIR / "data" / "test_interactions.csv"
REQUIRED_COLUMNS = {"user_id", "item_id", "item_type", "interaction"}
SUPPORTED_ITEM_TYPES = {"exercise", "food"}


class _ColdStartCollaborativeRecommender:
    """Represent the expected no-history result for synthetic users."""

    @staticmethod
    def recommend(user_id: int, top_n: int = 5) -> list[dict]:
        return []


def load_test_interactions(path: Path) -> pd.DataFrame:
    interactions = pd.read_csv(path)
    missing_columns = REQUIRED_COLUMNS - set(interactions.columns)

    if missing_columns:
        raise ValueError(
            "Evaluation dataset is missing columns: "
            + ", ".join(sorted(missing_columns))
        )
    if interactions.empty:
        raise ValueError("Evaluation dataset must contain at least one interaction")
    if not interactions["interaction"].isin([0, 1]).all():
        raise ValueError("interaction values must be 0 or 1")

    unsupported = set(interactions["item_type"]) - SUPPORTED_ITEM_TYPES
    if unsupported:
        raise ValueError("Unsupported item types: " + ", ".join(sorted(unsupported)))

    unknown_users = set(interactions["user_id"].astype(int)) - set(synthetic_profiles())
    if unknown_users:
        raise ValueError(
            "No synthetic profile exists for user ids: "
            + ", ".join(map(str, sorted(unknown_users)))
        )

    return interactions


def _recommendations_for(
    user_id: int,
    item_type: str,
    profile: dict,
    k: int,
    hybrid_recommender: HybridRecommender,
    foods: pd.DataFrame,
) -> list[dict]:
    if item_type == "exercise":
        return hybrid_recommender.recommend(profile, user_id, top_n=k)

    anchor_id = food_anchor_id(foods, profile)
    return recommend_foods(anchor_id, limit=k, user_preferences=profile)


def evaluate(test_interactions: pd.DataFrame, k: int) -> dict:
    """Macro-average metrics across each synthetic user and item type."""
    profiles = synthetic_profiles()
    foods = load_foods()
    hybrid_recommender = HybridRecommender(
        content_recommender=ContentBasedRecommender(),
        collaborative_recommender=_ColdStartCollaborativeRecommender(),
    )
    scores = []
    scores_by_type = {item_type: [] for item_type in SUPPORTED_ITEM_TYPES}

    for (user_id, item_type), labels in test_interactions.groupby(
        ["user_id", "item_type"]
    ):
        relevant_items = set(
            labels.loc[labels["interaction"] == 1, "item_id"].astype(int)
        )
        if not relevant_items:
            continue

        recommendations = _recommendations_for(
            int(user_id),
            str(item_type),
            profiles[int(user_id)],
            k,
            hybrid_recommender,
            foods,
        )
        cohort_score = (
            precision_at_k(recommendations, relevant_items, k),
            recall_at_k(recommendations, relevant_items, k),
            f1_at_k(recommendations, relevant_items, k),
            ndcg_at_k(recommendations, relevant_items, k),
        )
        scores.append(cohort_score)
        scores_by_type[str(item_type)].append(cohort_score)

    if not scores:
        return {
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "ndcg": 0.0,
            "cohorts": 0,
            "by_type": {},
        }

    return {
        "precision": sum(score[0] for score in scores) / len(scores),
        "recall": sum(score[1] for score in scores) / len(scores),
        "f1": sum(score[2] for score in scores) / len(scores),
        "ndcg": sum(score[3] for score in scores) / len(scores),
        "cohorts": len(scores),
        "by_type": {
            item_type: {
                "precision": sum(score[0] for score in item_scores)
                / len(item_scores),
                "recall": sum(score[1] for score in item_scores) / len(item_scores),
                "f1": sum(score[2] for score in item_scores) / len(item_scores),
                "ndcg": sum(score[3] for score in item_scores) / len(item_scores),
            }
            for item_type, item_scores in scores_by_type.items()
            if item_scores
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate the existing recommendation pipelines."
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

    test_interactions = load_test_interactions(args.data)
    results = evaluate(test_interactions, args.k)

    print("Recommendation Evaluation Results")
    print("---------------------------------")
    print(f"Dataset size: {len(test_interactions)}")
    print(f"Users evaluated: {test_interactions['user_id'].nunique()}")
    print(f"User/item cohorts: {results['cohorts']}")
    print()
    print(f"Precision@{args.k}: {results['precision']:.4f}")
    print(f"Recall@{args.k}: {results['recall']:.4f}")
    print(f"F1@{args.k}: {results['f1']:.4f}")
    print(f"NDCG@{args.k}: {results['ndcg']:.4f}")
    print()
    print("Breakdown by item type")
    for item_type in sorted(results["by_type"]):
        item_results = results["by_type"][item_type]
        print(
            f"{item_type.title()}: "
            f"Precision@{args.k}={item_results['precision']:.4f}, "
            f"Recall@{args.k}={item_results['recall']:.4f}, "
            f"F1@{args.k}={item_results['f1']:.4f}"
            f", NDCG@{args.k}={item_results['ndcg']:.4f}"
        )


if __name__ == "__main__":
    main()
