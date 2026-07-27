from models.collaborative_filter import (
    recommend_for_user,
    load_interactions
)

from models.exercise_recommender import (
    load_exercises,
    build_exercise_model
)


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

    used_body_parts = {}


    for item in recommendations:

        body_part = item["body_part"]


        count = used_body_parts.get(
            body_part,
            0
        )


        adjusted_score = item["score"]


        if count > 0:

            adjusted_score -= (
                0.05 * count
            )


        item["score"] = round(
            max(adjusted_score, 0),
            2
        )


        used_body_parts[body_part] = (
            count + 1
        )


        final_results.append(item)



    final_results.sort(
        key=lambda x: x["score"],
        reverse=True
    )


    return final_results[:limit]



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



        final_score = (
        0.25 * scores["cf_score"]
        +
        0.35 * preference_score
        +
        0.15 * difficulty_score
        +
        0.20 * body_part_score
        +
        0.05 * content_score
        +
        0.10 * feedback_score
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
                    "Hybrid recommendation based on user similarity, fitness goal, difficulty, body part, content similarity, feedback and diversity"
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
