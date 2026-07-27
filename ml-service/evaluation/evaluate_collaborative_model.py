from pathlib import Path
import pandas as pd
import random

from models.collaborative_filter import (
    recommend_for_user,
    load_exercises
)



# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "interactions.csv"
)


# ==========================================================
# Load Data
# ==========================================================

def load_data():

    df = pd.read_csv(DATASET_PATH)

    return df



# ==========================================================
# Evaluation
# ==========================================================

def evaluate():

    df = load_data()

    exercises_df = load_exercises()


    precision_scores = []
    recall_scores = []


    random.seed(42)


    users = (
        df["user_id"]
        .unique()
    )


    for user_id in users[:100]:


        user_history = df[
            df["user_id"] == user_id
        ]


        user_items = (
            user_history["item_id"]
            .tolist()
        )


        if len(user_items) < 5:
            continue



        # Hide items for testing

        test_items = set(
            random.sample(
                user_items,
                2
            )
        )



        # Training data
        # Remove hidden items only for this user

        train_df = df[
            ~(
                (df["user_id"] == user_id)
                &
                (df["item_id"].isin(test_items))
            )
        ]



        recommendations = recommend_for_user(
            int(user_id),
            train_df,
            exercises_df,
            5
        )



        recommended_items = set(
            item["exercise_id"]
            for item in recommendations
        )



        hits = (
            recommended_items
            &
            test_items
        )



        precision = (
            len(hits)
            /
            len(recommended_items)
            if recommended_items
            else 0
        )



        recall = (
            len(hits)
            /
            len(test_items)
        )



        precision_scores.append(
            precision
        )


        recall_scores.append(
            recall
        )



    print(
        "Collaborative Filtering Evaluation"
    )


    print(
        "Precision@5:",
        round(
            sum(precision_scores)
            /
            len(precision_scores),
            3
        )
    )


    print(
        "Recall@5:",
        round(
            sum(recall_scores)
            /
            len(recall_scores),
            3
        )
    )



if __name__ == "__main__":

    evaluate() 