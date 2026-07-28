"""Train the deep category model from persisted wellness interaction data."""

from models.deep_recommender import DeepRecommendationModel


def main() -> None:
    model = DeepRecommendationModel()
    trained = model.train()

    if trained:
        print(f"Saved deep recommendation model to {model.model_path}")
    else:
        print("Deep model was not trained: insufficient real labelled interaction data.")


if __name__ == "__main__":
    main()
