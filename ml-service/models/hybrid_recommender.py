from models.collaborative_filter import (
    recommend_for_user,
    load_interactions
)

from models.exercise_recommender import (
    load_exercises,
    build_exercise_model
)

from collections import Counter


# ==========================================================
# Preference Candidates
# ==========================================================

def get_preference_candidates(
    exercises,
    preferences,
    limit=50
):

    fitness_goal = preferences["fitness_goal"]

    filtered = exercises.copy()


    if fitness_goal == "Muscle Gain":

        filtered = filtered[
            filtered["exercise_type"].isin(
                [
                    "Strength",
                    "Powerlifting",
                    "Olympic Weightlifting"
                ]
            )
        ]


        filtered = filtered[
            filtered["equipment"].isin(
                [
                    "Dumbbell",
                    "Barbell",
                    "Cable",
                    "Machine",
                    "Kettlebells"
                ]
            )
        ]


    elif fitness_goal == "Weight Loss":

        filtered = filtered[
            filtered["exercise_type"].isin(
                [
                    "Cardio",
                    "Plyometrics"
                ]
            )
        ]


    elif fitness_goal == "Improve Endurance":

        filtered = filtered[
            filtered["exercise_type"].isin(
                [
                    "Cardio",
                    "Plyometrics"
                ]
            )
        ]


    return filtered.head(limit)



# ==========================================================
# Preference Score
# ==========================================================

def calculate_preference_score(
    exercise,
    preferences
):

    score = 0


    if preferences["fitness_goal"] == "Muscle Gain":

        if exercise["exercise_type"] in [
            "Strength",
            "Powerlifting",
            "Olympic Weightlifting"
        ]:
            score += 0.7


        if exercise["equipment"] in [
            "Dumbbell",
            "Barbell",
            "Cable",
            "Machine"
        ]:
            score += 0.3



    elif preferences["fitness_goal"] == "Weight Loss":

        if exercise["exercise_type"] in [
            "Cardio",
            "Plyometrics"
        ]:
            score += 1



    elif preferences["fitness_goal"] == "Improve Endurance":

        if exercise["exercise_type"] in [
            "Cardio",
            "Plyometrics"
        ]:
            score += 1



    return min(score, 1)



# ==========================================================
# Difficulty Score
# ==========================================================

def calculate_difficulty_score(
    exercise,
    preferences
):

    activity = preferences["activity_level"]


    if (
        activity == "Beginner"
        and exercise["difficulty_level"] == "Beginner"
    ):
        return 1


    if (
        activity == "Intermediate"
        and exercise["difficulty_level"] == "Intermediate"
    ):
        return 1


    if (
        activity == "Advanced"
        and exercise["difficulty_level"] == "Expert"
    ):
        return 1


    return 0.5



# ==========================================================
# Body Part Score
# ==========================================================

def calculate_body_part_score(
    exercise,
    preferences
):

    fitness_goal = preferences["fitness_goal"]


    if fitness_goal == "Muscle Gain":

        preferred_parts = [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Quadriceps",
            "Hamstrings",
            "Glutes"
        ]


        if exercise["body_part"] in preferred_parts:
            return 1


        if exercise["body_part"] == "Abdominals":
            return 0.3



    elif fitness_goal == "Weight Loss":

        preferred_parts = [
            "Full Body",
            "Quadriceps",
            "Hamstrings",
            "Calves"
        ]


        if exercise["body_part"] in preferred_parts:
            return 1



    elif fitness_goal == "Improve Endurance":

        preferred_parts = [
            "Quadriceps",
            "Hamstrings",
            "Calves",
            "Full Body"
        ]


        if exercise["body_part"] in preferred_parts:
            return 1



    return 0.5



# ==========================================================
# Content Similarity Score
# ==========================================================

def calculate_content_score(
    exercise_id,
    similarity_matrix,
    exercise_index
):

    if exercise_id not in exercise_index:
        return 0


    index = exercise_index[exercise_id]


    scores = similarity_matrix[index]


    similar_scores = sorted(
        scores,
        reverse=True
    )[1:6]


    if len(similar_scores) == 0:
        return 0


    return round(
        float(
            sum(similar_scores)
            /
            len(similar_scores)
        ),
        2
    )



# ==========================================================
# Diversity Adjustment
# ==========================================================

def apply_diversity_penalty(
    recommendations,
    limit
):
    final_results = []
    remaining = recommendations.copy()
    used_body_parts = set()
    used_equipment = set()

    while remaining and len(final_results) < limit:
        def diversity_score(item):
            penalty = 0

            if item["body_part"] in used_body_parts:
                penalty += 0.08

            if item["equipment"] in used_equipment:
                penalty += 0.06

            return item["score"] - penalty

        selected = max(remaining, key=diversity_score)
        selected["score"] = round(
            max(diversity_score(selected), 0),
            2
        )

        used_body_parts.add(selected["body_part"])
        used_equipment.add(selected["equipment"])
        final_results.append(selected)
        remaining.remove(selected)

    return final_results



# ==========================================================
# Hybrid Recommendation
# ==========================================================

def calculate_feedback_score(
    exercise_id,
    feedback_scores,
    content_similarity_matrix,
    exercise_index
):

    if not feedback_scores:
        return 0

    candidate_index = exercise_index.get(int(exercise_id))

    if candidate_index is None:
        return 0

    feedback_score = 0

    for feedback_exercise_id, score in feedback_scores.items():
        feedback_index = exercise_index.get(int(feedback_exercise_id))

        if feedback_index is not None:
            feedback_score += (
                content_similarity_matrix[candidate_index][feedback_index]
                * score
            )

    return feedback_score


# ==========================================================
# User Behaviour
# ==========================================================

def build_user_behavior_profile(
    user_id,
    interactions,
    exercises
):
    user_interactions = interactions[
        interactions["user_id"] == user_id
    ]

    completed_ids = set(
        user_interactions["item_id"].astype(int).tolist()
    )

    completed_exercises = user_interactions.merge(
        exercises,
        left_on="item_id",
        right_on="exercise_id",
        how="inner"
    )

    def category_counts(column):
        if column not in completed_exercises:
            return {}

        return Counter(
            completed_exercises[column]
            .dropna()
            .astype(str)
            .tolist()
        )

    return {
        "completed_ids": completed_ids,
        "body_parts": category_counts("body_part"),
        "equipment": category_counts("equipment"),
        "difficulty_levels": category_counts("difficulty_level"),
        "exercise_types": category_counts("exercise_type")
    }


def calculate_behavior_score(
    exercise,
    behavior_profile
):
    category_weights = [
        ("body_parts", "body_part", 0.35),
        ("equipment", "equipment", 0.20),
        ("difficulty_levels", "difficulty_level", 0.25),
        ("exercise_types", "exercise_type", 0.20)
    ]

    score = 0
    available_weight = 0

    for profile_key, exercise_key, weight in category_weights:
        counts = behavior_profile[profile_key]

        if not counts:
            continue

        available_weight += weight
        score += weight * (
            counts.get(str(exercise[exercise_key]), 0)
            / sum(counts.values())
        )

    if available_weight == 0:
        return 0.5

    return min(score / available_weight, 1)


def generate_recommendation_reason(
    exercise,
    preferences,
    behavior_profile,
    feedback_score
):
    goal = preferences["fitness_goal"].lower()

    if feedback_score > 0.2:
        return (
            "Recommended because you liked similar "
            f"{exercise['exercise_type'].lower()} exercises and this "
            f"matches your {goal} goal."
        )

    difficulty_count = behavior_profile["difficulty_levels"].get(
        str(exercise["difficulty_level"]),
        0
    )

    if difficulty_count:
        return (
            "Recommended because you usually complete "
            f"{exercise['difficulty_level'].lower()}-level workouts."
        )

    body_part_count = behavior_profile["body_parts"].get(
        str(exercise["body_part"]),
        0
    )

    if body_part_count:
        return (
            "Recommended because you frequently select "
            f"{exercise['body_part'].lower()} exercises and it supports "
            f"your {goal} goal."
        )

    return (
        f"Recommended because it matches your {goal} goal and "
        f"{preferences['activity_level'].lower()} activity level."
    )


def hybrid_recommendations(
    user_id,
    preferences,
    limit=5,
    feedback_scores=None
):

    interactions = load_interactions()

    exercises = load_exercises()


    content_df, content_similarity_matrix = (
        build_exercise_model()
    )


    exercise_index = {
        int(row["exercise_id"]): index
        for index, row
        in content_df.iterrows()
    }



    collaborative_results = recommend_for_user(
        user_id,
        interactions,
        exercises,
        50
    )



    candidates = {}
    feedback_scores = feedback_scores or {}
    behavior_profile = build_user_behavior_profile(
        user_id,
        interactions,
        exercises
    )



    for item in collaborative_results:

        candidates[item["exercise_id"]] = {
            "cf_score": item["score"]
        }



    preference_results = get_preference_candidates(
        exercises,
        preferences,
        50
    )


    for _, exercise in preference_results.iterrows():

        if exercise["exercise_id"] not in candidates:

            candidates[
                exercise["exercise_id"]
            ] = {
                "cf_score": 0
            }



    recommendations = []



    for exercise_id, scores in candidates.items():


        exercise = exercises[
            exercises["exercise_id"] == exercise_id
        ]


        if len(exercise) == 0:
            continue


        exercise = exercise.iloc[0]



        preference_score = calculate_preference_score(
            exercise,
            preferences
        )


        difficulty_score = calculate_difficulty_score(
            exercise,
            preferences
        )


        body_part_score = calculate_body_part_score(
            exercise,
            preferences
        )


        content_score = calculate_content_score(
            int(exercise["exercise_id"]),
            content_similarity_matrix,
            exercise_index
        )

        feedback_score = calculate_feedback_score(
            int(exercise["exercise_id"]),
            feedback_scores,
            content_similarity_matrix,
            exercise_index
        )

        behavior_score = calculate_behavior_score(
            exercise,
            behavior_profile
        )



        final_score = (
        0.20 * scores["cf_score"]
        +
        0.30 * preference_score
        +
        0.12 * difficulty_score
        +
        0.15 * body_part_score
        +
        0.08 * content_score
        +
        0.08 * feedback_score
        +
        0.07 * behavior_score
    )



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
                        final_score,
                        2
                    ),

                "reason":
                    generate_recommendation_reason(
                        exercise,
                        preferences,
                        behavior_profile,
                        feedback_score
                    )
            }
        )



    recommendations.sort(
        key=lambda x: x["score"],
        reverse=True
    )


    return apply_diversity_penalty(
        recommendations,
        limit
    )
