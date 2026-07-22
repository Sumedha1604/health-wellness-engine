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
    / "exercises.csv"
)


# ==========================================================
# Load Dataset
# ==========================================================

def load_exercises():

    df = pd.read_csv(DATASET_PATH)

    df = df.fillna("")

    return df



# ==========================================================
# Build Model
# ==========================================================

def build_exercise_model():

    df = load_exercises()


    df["features"] = (
    df["title"].astype(str)
    + " "
    + df["exercise_type"].astype(str)
    + " "
    + df["body_part"].astype(str)
    + " "
    + df["equipment"].astype(str)
    + " "
    + df["difficulty_level"].astype(str)
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
# Recommend Exercises
# ==========================================================

def recommend_exercises(
    exercise_id,
    limit=5
):

    df, similarity_matrix = build_exercise_model()


    index = df.index[
        df["exercise_id"] == exercise_id
    ][0]


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

        exercise = df.iloc[idx]


        recommendations.append(
            {
                "exercise_id":
                    int(exercise["exercise_id"]),

                "title":
                    exercise["title"],

                "similarity_score":
                    round(float(score), 2),

                "reason":
                    "Similar exercise based on type, body part, equipment and difficulty"
            }
        )


    return recommendations	
