from pathlib import Path
import pandas as pd

from models.hybrid_recommender import hybrid_recommendations


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



def load_users():

    df = pd.read_csv(
        INTERACTIONS_PATH
    )

    return df["user_id"].unique()



def load_exercises():

    return pd.read_csv(
        EXERCISES_PATH
    )



def get_exercise_type(
    exercise_id,
    exercises
):

    result = exercises[
        exercises["exercise_id"] == exercise_id
    ]

    if len(result) == 0:
        return ""

    return result.iloc[0]["exercise_type"]



def check_goal_match(
    recommendation,
    fitness_goal,
    exercises
):

    exercise_type = get_exercise_type(
        recommendation["exercise_id"],
        exercises
    )

    equipment = recommendation["equipment"]


    if fitness_goal == "Muscle Gain":

        return 1 if (
            exercise_type in [
                "Strength",
                "Powerlifting",
                "Olympic Weightlifting"
            ]
        ) else 0



    if fitness_goal == "Weight Loss":

        return 1 if (
            exercise_type in [
                "Cardio",
                "Plyometrics"
            ]
        ) else 0



    if fitness_goal == "Improve Endurance":

        return 1 if (
            exercise_type in [
                "Cardio",
                "Plyometrics"
            ]
        ) else 0



    return 0



def check_difficulty_match(
    recommendation,
    activity_level
):

    difficulty = recommendation[
        "difficulty_level"
    ]


    if activity_level == "Beginner":

        return 1 if difficulty in [
            "Beginner",
            "Intermediate"
        ] else 0


    if activity_level == "Intermediate":

        return 1 if difficulty == "Intermediate" else 0


    if activity_level == "Advanced":

        return 1 if difficulty == "Expert" else 0


    return 0



def check_body_part_match(
    recommendation,
    fitness_goal
):

    body_part = recommendation[
        "body_part"
    ]


    if fitness_goal == "Muscle Gain":

        good_parts = [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Quadriceps",
            "Hamstrings",
            "Glutes"
        ]

        return 1 if body_part in good_parts else 0


    return 1



def evaluate():

    users = load_users()

    exercises = load_exercises()


    goal_scores = []
    difficulty_scores = []
    body_scores = []


    tested = 0



    profiles = [
        {
            "fitness_goal": "Muscle Gain",
            "activity_level": "Beginner"
        },
        {
            "fitness_goal": "Weight Loss",
            "activity_level": "Beginner"
        },
        {
            "fitness_goal": "Improve Endurance",
            "activity_level": "Intermediate"
        }
    ]



    for user_id in users[:100]:

        for profile in profiles:

            recommendations = hybrid_recommendations(
                int(user_id),
                profile,
                5
            )


            if not recommendations:
                continue


            tested += 1


            for item in recommendations:

                goal_scores.append(
                    check_goal_match(
                        item,
                        profile["fitness_goal"],
                        exercises
                    )
                )


                difficulty_scores.append(
                    check_difficulty_match(
                        item,
                        profile["activity_level"]
                    )
                )


                body_scores.append(
                    check_body_part_match(
                        item,
                        profile["fitness_goal"]
                    )
                )



    print(
        "Hybrid Recommendation Evaluation"
    )


    print(
        "Users Tested:",
        tested
    )


    print(
        "Goal Match Accuracy:",
        round(
            sum(goal_scores)
            /
            len(goal_scores)
            *
            100,
            2
        ),
        "%"
    )


    print(
        "Difficulty Match Accuracy:",
        round(
            sum(difficulty_scores)
            /
            len(difficulty_scores)
            *
            100,
            2
        ),
        "%"
    )


    print(
        "Body Part Accuracy:",
        round(
            sum(body_scores)
            /
            len(body_scores)
            *
            100,
            2
        ),
        "%"
    )



if __name__ == "__main__":
    evaluate()