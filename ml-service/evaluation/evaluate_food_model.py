from pathlib import Path
import pandas as pd

from models.food_recommender import recommend_foods


BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "foods.csv"
)


def load_foods():

    return pd.read_csv(DATASET_PATH)



def evaluate():

    df = load_foods()

    similarity_scores = []

    sample_foods = (
        df["food_id"]
        .sample(
            20,
            random_state=42
        )
    )


    for food_id in sample_foods:

        recommendations = recommend_foods(
            int(food_id),
            5
        )


        for item in recommendations:

            similarity_scores.append(
                item["similarity_score"]
            )


    average_similarity = (
        sum(similarity_scores)
        /
        len(similarity_scores)
    )


    print(
        "Food Recommendation Evaluation"
    )

    print(
        "Average Similarity Score:",
        round(
            average_similarity,
            3
        )
    )

    print(
        "Evaluated Recommendations:",
        len(similarity_scores)
    )



if __name__ == "__main__":
    evaluate()