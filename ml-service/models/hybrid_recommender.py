from models.collaborative_filter import (
    recommend_for_user,
    load_interactions
)

from models.exercise_recommender import (
    load_exercises,
    build_exercise_model
)

from collections import Counter

import pandas as pd

from models.collaborative_recommender import CollaborativeRecommender
from models.content_recommender import ContentBasedRecommender


class HybridRecommender:
    """Combine profile-based and behaviour-based exercise recommendations.

    The two recommenders remain independent.  This class only coordinates their
    ranked results, which lets a content result remain useful for a new user
    while incorporating collaborative signals as interaction data becomes
    available.
    """

    def __init__(
        self,
        content_recommender: ContentBasedRecommender | None = None,
        collaborative_recommender: CollaborativeRecommender | None = None,
        content_weight: float = 0.5,
        collaborative_weight: float = 0.5,
        goal_weight: float = 0.8,
        activity_weight: float = 0.3,
        difficulty_weight: float = 0.4,
        diet_weight: float = 0.2,
        candidate_pool_multiplier: int = 5,
    ):
        weights = (
            content_weight,
            collaborative_weight,
            goal_weight,
            activity_weight,
            difficulty_weight,
            diet_weight,
        )
        if any(weight < 0 for weight in weights):
            raise ValueError("Recommendation weights must be non-negative")

        if sum(weights) == 0:
            raise ValueError("At least one recommendation weight must be positive")
        if not isinstance(candidate_pool_multiplier, int) or candidate_pool_multiplier < 1:
            raise ValueError("candidate_pool_multiplier must be a positive integer")

        self.content_recommender = content_recommender or ContentBasedRecommender()
        self.collaborative_recommender = (
            collaborative_recommender or CollaborativeRecommender()
        )
        self.content_weight = content_weight
        self.collaborative_weight = collaborative_weight
        self.goal_weight = goal_weight
        self.activity_weight = activity_weight
        self.difficulty_weight = difficulty_weight
        self.diet_weight = diet_weight
        self.candidate_pool_multiplier = candidate_pool_multiplier

    def get_content_recommendations(
        self,
        user_profile: dict,
        top_n: int,
    ) -> list[dict]:
        """Retrieve profile-based recommendations without altering their model."""

        return self.content_recommender.recommend(user_profile, top_n=top_n)

    def get_collaborative_recommendations(
        self,
        user_id: int,
        top_n: int,
    ) -> list[dict]:
        """Retrieve behaviour-based recommendations for an existing user."""

        return self.collaborative_recommender.recommend(user_id, top_n=top_n)

    def combine_scores(
        self,
        content_recommendations: list[dict],
        collaborative_recommendations: list[dict],
        top_n: int,
        user_profile: dict | None = None,
    ) -> list[dict]:
        """Merge recommendation scores by exercise id using weighted ranking.

        A result supplied by only one healthy model keeps that model's score.
        This is deliberate: reducing it by half would make a cold-start result
        look artificially weak even though content filtering is the only signal
        available for that user.
        """

        candidates: dict[int, dict] = {}
        content_scores = self._normalise_scores(content_recommendations)
        collaborative_scores = self._normalise_scores(collaborative_recommendations)
        exercise_features = self._exercise_features()

        for recommendation in content_recommendations:
            exercise_id = int(recommendation["exercise_id"])
            candidates[exercise_id] = {
                "exercise_id": exercise_id,
                "name": str(recommendation["name"]),
                "content_score": content_scores[exercise_id],
                "collaborative_score": None,
                "content_reason": recommendation.get("reason"),
                "collaborative_reason": None,
            }

        for recommendation in collaborative_recommendations:
            exercise_id = int(recommendation["exercise_id"])
            candidate = candidates.setdefault(
                exercise_id,
                {
                    "exercise_id": exercise_id,
                    "name": str(recommendation["name"]),
                    "content_score": None,
                    "collaborative_score": None,
                    "content_reason": None,
                    "collaborative_reason": None,
                },
            )
            candidate["name"] = candidate["name"] or str(recommendation["name"])
            candidate["collaborative_score"] = collaborative_scores[exercise_id]
            candidate["collaborative_reason"] = recommendation.get("reason")

        combined = []
        for candidate in candidates.values():
            content_score = candidate["content_score"]
            collaborative_score = candidate["collaborative_score"]

            weighted_signals = []
            if content_score is not None:
                weighted_signals.append((content_score, self.content_weight))
            if collaborative_score is not None:
                weighted_signals.append(
                    (collaborative_score, self.collaborative_weight)
                )

            features = exercise_features.get(candidate["exercise_id"])
            if user_profile and features:
                weighted_signals.extend(
                    self._relevance_signals(features, user_profile)
                )

            available_weight = sum(weight for _, weight in weighted_signals if weight)
            score = (
                sum(value * weight for value, weight in weighted_signals)
                / available_weight
                if available_weight
                else 0.0
            )

            if content_score is not None and collaborative_score is not None:
                source = "hybrid"
            elif content_score is not None:
                source = "content"
            else:
                source = "collaborative"

            combined.append(
                {
                    "exercise_id": candidate["exercise_id"],
                    "name": candidate["name"],
                    "score": round(float(score), 4),
                    "source": source,
                    "reason": self._combined_reason(candidate, source),
                }
            )

        return sorted(
            combined,
            key=lambda recommendation: (
                -recommendation["score"], recommendation["exercise_id"]
            ),
        )[:top_n]

    @staticmethod
    def _normalise_scores(recommendations: list[dict]) -> dict[int, float]:
        """Min-max normalise one model without comparing unlike score scales."""
        if not recommendations:
            return {}

        raw_scores = [float(item["score"]) for item in recommendations]
        minimum, maximum = min(raw_scores), max(raw_scores)
        if maximum == minimum:
            return {
                int(item["exercise_id"]): 1.0 if maximum > 0 else 0.0
                for item in recommendations
            }

        return {
            int(item["exercise_id"]): (float(item["score"]) - minimum)
            / (maximum - minimum)
            for item in recommendations
        }

    def _exercise_features(self) -> dict[int, dict]:
        exercises = getattr(self.content_recommender, "exercises", None)
        if not isinstance(exercises, pd.DataFrame) or exercises.empty:
            return {}
        return exercises.set_index("exercise_id").to_dict("index")

    def _relevance_signals(self, exercise: dict, profile: dict) -> list[tuple]:
        goal_type = ContentBasedRecommender._goal_exercise_type(
            str(profile.get("fitness_goal", ""))
        )
        expected_difficulty = ContentBasedRecommender._activity_difficulty(
            str(profile.get("activity_level", ""))
        )
        actual_difficulty = str(exercise.get("difficulty_level", ""))
        signals = []

        if goal_type:
            signals.append(
                (float(str(exercise.get("exercise_type", "")) == goal_type), self.goal_weight)
            )
        if expected_difficulty:
            exact_match = float(actual_difficulty == expected_difficulty)
            signals.append((exact_match, self.activity_weight))
            difficulty_order = {"Beginner": 0, "Intermediate": 1, "Expert": 2}
            distance = abs(
                difficulty_order.get(actual_difficulty, 3)
                - difficulty_order.get(expected_difficulty, 3)
            )
            signals.append((max(0.0, 1.0 - 0.5 * distance), self.difficulty_weight))

        # Diet relevance is included when a future exercise catalogue exposes
        # compatible diet metadata; unavailable signals do not dilute scoring.
        diet_preference = profile.get("diet_preference")
        if diet_preference and "diet_preference" in exercise:
            signals.append(
                (
                    float(str(exercise["diet_preference"]) == str(diet_preference)),
                    self.diet_weight,
                )
            )
        return signals

    def recommend(
        self,
        user_profile: dict,
        user_id: int,
        top_n: int = 5,
    ) -> list[dict]:
        """Return the best available recommendations from both model signals."""

        if not isinstance(user_id, int) or user_id < 1:
            raise ValueError("user_id must be a positive integer")

        if not isinstance(top_n, int) or top_n < 1:
            raise ValueError("top_n must be a positive integer")

        content_recommendations = []
        collaborative_recommendations = []
        candidate_pool_size = top_n * self.candidate_pool_multiplier

        try:
            content_recommendations = self.get_content_recommendations(
                user_profile,
                candidate_pool_size,
            )
        # An unavailable dataset or database must not prevent the other model
        # from serving its recommendations.
        except Exception:
            pass

        try:
            collaborative_recommendations = self.get_collaborative_recommendations(
                user_id,
                candidate_pool_size,
            )
        except Exception:
            pass

        return self.combine_scores(
            content_recommendations,
            collaborative_recommendations,
            top_n,
            user_profile,
        )

    @staticmethod
    def _combined_reason(candidate: dict, source: str) -> str:
        """Keep the strongest available explanation across model signals."""
        content_reason = candidate.get("content_reason")
        collaborative_reason = candidate.get("collaborative_reason")

        if source == "hybrid" and content_reason and collaborative_reason:
            return (
                f"{content_reason.rstrip('.')} It is also supported by similar "
                "user preferences."
            )

        if source == "content" and content_reason:
            return content_reason

        if source == "collaborative" and collaborative_reason:
            return collaborative_reason

        return "Recommended using the available fitness profile and behaviour signals."


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
