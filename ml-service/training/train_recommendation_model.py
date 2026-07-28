"""Train and save an offline collaborative recommendation model artifact.

This pipeline is deliberately separate from the FastAPI runtime recommenders.
It produces a reusable user-item preference matrix and cosine-similarity matrix
from recorded interactions without changing recommendation endpoint behaviour.
"""

from pathlib import Path
import argparse
import pickle

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


ML_SERVICE_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATASET_PATH = ML_SERVICE_ROOT / "data" / "sample_interactions.csv"
DEFAULT_MODEL_PATH = ML_SERVICE_ROOT / "models" / "saved" / "recommendation_model.pkl"
REQUIRED_COLUMNS = {"user_id", "exercise_id", "rating", "completed", "timestamp"}


def load_interactions(dataset_path=DEFAULT_DATASET_PATH):
    """Load and validate interaction data used by the training pipeline."""
    dataset_path = Path(dataset_path)
    interactions = pd.read_csv(dataset_path)
    missing_columns = REQUIRED_COLUMNS.difference(interactions.columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Interaction dataset is missing required columns: {missing}")

    if interactions.empty:
        raise ValueError("Interaction dataset must contain at least one row")

    return interactions.copy()


def prepare_training_dataset(interactions):
    """Convert interaction records into a weighted user-item preference matrix."""
    missing_columns = REQUIRED_COLUMNS.difference(interactions.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Interaction dataset is missing required columns: {missing}")

    prepared = interactions.copy()
    prepared["user_id"] = pd.to_numeric(prepared["user_id"], errors="raise")
    prepared["exercise_id"] = pd.to_numeric(prepared["exercise_id"], errors="raise")
    prepared["rating"] = pd.to_numeric(prepared["rating"], errors="raise")

    if prepared["rating"].lt(0).any() or prepared["rating"].gt(5).any():
        raise ValueError("Interaction ratings must be between 0 and 5")

    completed_values = prepared["completed"].astype(str).str.strip().str.lower()
    completed = completed_values.isin({"true", "1", "yes"}).astype(float)
    prepared["preference_score"] = prepared["rating"] / 5 + completed

    return prepared.pivot_table(
        index="user_id",
        columns="exercise_id",
        values="preference_score",
        aggfunc="mean",
        fill_value=0.0,
    )


def train_recommendation_model(interactions):
    """Train an item-preference artifact from a validated interaction dataset."""
    user_item_matrix = prepare_training_dataset(interactions)
    if user_item_matrix.empty:
        raise ValueError("Cannot train a recommendation model from empty interactions")

    similarity = cosine_similarity(user_item_matrix)
    similarity_matrix = pd.DataFrame(
        similarity,
        index=user_item_matrix.index,
        columns=user_item_matrix.index,
    )

    return {
        "model_type": "user_cosine_similarity",
        "user_item_matrix": user_item_matrix,
        "similarity_matrix": similarity_matrix,
    }


def save_model(model_artifact, model_path=DEFAULT_MODEL_PATH):
    """Persist a trained model artifact and return its filesystem path."""
    model_path = Path(model_path)
    model_path.parent.mkdir(parents=True, exist_ok=True)

    with model_path.open("wb") as model_file:
        pickle.dump(model_artifact, model_file)

    return model_path


def run_training(dataset_path=DEFAULT_DATASET_PATH, model_path=DEFAULT_MODEL_PATH):
    """Load interactions, train the model, save it, and return the artifact path."""
    interactions = load_interactions(dataset_path)
    model_artifact = train_recommendation_model(interactions)
    return save_model(model_artifact, model_path)


def main():
    """Run the offline trainer from the command line."""
    parser = argparse.ArgumentParser(description="Train the recommendation model.")
    parser.add_argument("--data", default=DEFAULT_DATASET_PATH, help="CSV interaction dataset.")
    parser.add_argument("--output", default=DEFAULT_MODEL_PATH, help="Model artifact path.")
    args = parser.parse_args()

    model_path = run_training(args.data, args.output)
    print(f"Saved recommendation model to {model_path}")


if __name__ == "__main__":
    main()
