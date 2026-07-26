from pathlib import Path

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

INTERACTIONS_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "interactions.csv"
)

EXERCISES_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "exercises.csv"
)


# ==========================================================
# Load Data
# ==========================================================

def load_interactions():

    df = pd.read_csv(INTERACTIONS_PATH)

    return df



def load_exercises():

    df = pd.read_csv(EXERCISES_PATH)

    return df



# ==========================================================
# Build User Similarity Model
# ==========================================================

def build_user_similarity():

    df = load_interactions()


    user_item_matrix = (
        df
        .pivot_table(
            index="user_id",
            columns="item_id",
            values="interaction",
            fill_value=0
        )
    )


    similarity_matrix = cosine_similarity(
        user_item_matrix
    )


    similarity_df = pd.DataFrame(
        similarity_matrix,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )


    return (
        user_item_matrix,
        similarity_df
    )



# ==========================================================
# Recommend Items
# ==========================================================

def recommend_for_user(
    user_id,
    limit=5
):

    interactions = load_interactions()

    exercises = load_exercises()


    user_item_matrix, similarity_df = (
        build_user_similarity()
    )


    if user_id not in similarity_df.index:
        return []


    similar_users = (
        similarity_df[user_id]
        .sort_values(
            ascending=False
        )
        .iloc[1:]
    )


    user_items = set(
        interactions[
            interactions["user_id"] == user_id
        ]["item_id"]
    )


    recommendations = []


    for similar_user in similar_users.index:

        similar_user_items = interactions[
            interactions["user_id"] == similar_user
        ]


        for _, row in similar_user_items.iterrows():

            item_id = row["item_id"]


            if item_id not in user_items:


                exercise = exercises[
                    exercises["exercise_id"] == item_id
                ]


                if len(exercise) > 0:

                    exercise = exercise.iloc[0]


                    recommendations.append(
                        {
                            "exercise_id":
                                int(exercise["exercise_id"]),

                            "title":
                                exercise["title"],

                            "body_part":
                                exercise["body_part"],

                            "equipment":
                                exercise["equipment"],

                            "difficulty_level":
                                exercise["difficulty_level"],

                            "score":
                                round(
                                    float(
                                        similar_users[similar_user]
                                    ),
                                    2
                                ),

                            "reason":
                                "Recommended based on similar users"
                        }
                    )


            if len(recommendations) >= limit:
                return recommendations


    return recommendations