from pathlib import Path
import random
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent


EXERCISE_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "exercises.csv"
)


OUTPUT_PATH = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "interactions.csv"
)


def generate_interactions():

    exercises = pd.read_csv(EXERCISE_PATH)


    strength = exercises[
        exercises["exercise_type"] == "Strength"
    ]["exercise_id"].tolist()


    bodyweight = exercises[
        exercises["equipment"] == "Body Only"
    ]["exercise_id"].tolist()


    cardio = exercises[
        exercises["exercise_type"] == "Cardio"
    ]["exercise_id"].tolist()


    groups = [
        strength,
        bodyweight,
        cardio
    ]


    random.seed(42)

    interactions = []


    users = 1000


    for user_id in range(1, users + 1):

        user_group = random.choice(groups)


        # common exercises for this user category
        selected = random.sample(
            user_group,
            15
        )


        # add small variation
        variation_pool = list(
            set(user_group) - set(selected)
        )


        selected += random.sample(
            variation_pool,
            5
        )


        for exercise_id in selected:

            interactions.append(
                {
                    "user_id": user_id,
                    "item_id": exercise_id,
                    "item_type": "exercise",
                    "interaction": 1
                }
            )


    df = pd.DataFrame(
        interactions
    )


    df.to_csv(
        OUTPUT_PATH,
        index=False
    )


    print("Interactions:", len(df))
    print("Users:", df.user_id.nunique())
    print("Items:", df.item_id.nunique())


if __name__ == "__main__":
    generate_interactions()