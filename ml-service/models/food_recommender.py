from pathlib import Path
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "foods.csv"
)


# ==========================================================
# Load Dataset
# ==========================================================

def load_foods():

    df = pd.read_csv(DATASET_PATH)

    df = df.fillna("")

    return df



# ==========================================================
# Build Model
# ==========================================================

def build_food_model():

    df = load_foods()


    df["features"] = (
        df["food_name"].astype(str)
        + " "
        + df["caloric_value"].astype(str)
        + " calories "
        + df["protein"].astype(str)
        + " protein "
        + df["carbohydrates"].astype(str)
        + " carbohydrates "
        + df["fat"].astype(str)
        + " fat"
    )


    vectorizer = TfidfVectorizer()


    vectors = vectorizer.fit_transform(
        df["features"]
    )


    similarity_matrix = cosine_similarity(
        vectors
    )


    return (
        df,
        similarity_matrix
    )



# ==========================================================
# Recommend Foods
# ==========================================================

def recommend_foods(
    food_id,
    limit=5
):

    df, similarity_matrix = build_food_model()

    matches = df.index[
        df["food_id"] == food_id
    ]

    if len(matches) == 0:
        return []

    index = matches[0]

    scores = list(
        enumerate(
            similarity_matrix[index]
        )
    )

    scores = sorted(
        scores,
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = []

    for idx, score in scores[1:limit+1]:

        food = df.iloc[idx]

        recommendations.append(
            {
                "food_id":
                    int(food["food_id"]),

                "food_name":
                    food["food_name"],

                "similarity_score":
                    round(float(score), 2),

                "reason":
                    "Similar food based on nutrition profile"
            }
        )

    return recommendations