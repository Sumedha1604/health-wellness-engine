"""User-based collaborative exercise recommendations from tracked interactions."""

from pathlib import Path
from typing import Callable
import os

import mysql.connector
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")


class CollaborativeRecommender:
    """Recommend unseen exercises preferred by users with similar behaviour."""

    def __init__(
        self,
        interaction_loader: Callable[[], pd.DataFrame] | None = None,
        exercise_loader: Callable[[], pd.DataFrame] | None = None,
    ):
        self.interaction_loader = interaction_loader
        self.exercise_loader = exercise_loader
        self.interactions: pd.DataFrame | None = None
        self.exercises: pd.DataFrame | None = None
        self.user_item_matrix: pd.DataFrame | None = None
        self.similarity_matrix: pd.DataFrame | None = None

    def load_interactions(self) -> pd.DataFrame:
        """Load persisted recommendation interactions from the application DB."""

        if self.interaction_loader:
            interactions = self.interaction_loader()
        else:
            interactions = self._read_database(
                """
                SELECT
                    user_id,
                    exercise_id,
                    action,
                    rating,
                    completed,
                    created_at AS timestamp
                FROM recommendation_interactions
                ORDER BY created_at ASC, id ASC
                """
            )

        required_columns = {
            "user_id",
            "exercise_id",
            "action",
            "rating",
            "completed",
        }
        missing_columns = required_columns.difference(interactions.columns)

        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise ValueError(f"Interactions are missing required columns: {missing}")

        self.interactions = interactions.copy()

        return self.interactions

    def load_exercises(self) -> pd.DataFrame:
        """Load real exercise names for the collaborative response payload."""

        if self.exercise_loader:
            exercises = self.exercise_loader()
        else:
            exercises = self._read_database(
                """
                SELECT
                    exercise_id,
                    title
                FROM exercises
                """
            )

        required_columns = {"exercise_id", "title"}
        missing_columns = required_columns.difference(exercises.columns)

        if missing_columns:
            missing = ", ".join(sorted(missing_columns))
            raise ValueError(f"Exercises are missing required columns: {missing}")

        self.exercises = exercises.copy()

        return self.exercises

    def create_user_item_matrix(self) -> pd.DataFrame:
        """Aggregate real interaction strength for each user/exercise pair."""

        if self.interactions is None:
            self.load_interactions()

        if self.interactions.empty:
            self.user_item_matrix = pd.DataFrame()
            return self.user_item_matrix

        weighted_interactions = self.interactions.copy()
        weighted_interactions["interaction_score"] = (
            weighted_interactions.apply(self._interaction_score, axis=1)
        )

        self.user_item_matrix = weighted_interactions.pivot_table(
            index="user_id",
            columns="exercise_id",
            values="interaction_score",
            aggfunc="sum",
            fill_value=0.0,
        )

        return self.user_item_matrix

    def calculate_similarity(self) -> pd.DataFrame:
        """Calculate cosine similarity between user interaction vectors."""

        if self.user_item_matrix is None:
            self.create_user_item_matrix()

        if self.user_item_matrix.empty:
            self.similarity_matrix = pd.DataFrame()
            return self.similarity_matrix

        similarities = cosine_similarity(self.user_item_matrix)
        self.similarity_matrix = pd.DataFrame(
            similarities,
            index=self.user_item_matrix.index,
            columns=self.user_item_matrix.index,
        )

        return self.similarity_matrix

    def recommend(self, user_id: int, top_n: int = 5) -> list[dict]:
        """Recommend unseen exercises from positively similar users."""

        if not isinstance(user_id, int) or user_id < 1:
            raise ValueError("user_id must be a positive integer")

        if not isinstance(top_n, int) or top_n < 1:
            raise ValueError("top_n must be a positive integer")

        if self.interactions is None:
            self.load_interactions()

        if self.interactions.empty:
            return []

        if self.user_item_matrix is None:
            self.create_user_item_matrix()

        if user_id not in self.user_item_matrix.index:
            return []

        if self.similarity_matrix is None:
            self.calculate_similarity()

        similar_users = self.similarity_matrix.loc[user_id].drop(user_id)
        similar_users = similar_users[similar_users > 0]

        if similar_users.empty:
            return []

        user_items = set(
            self.user_item_matrix.loc[user_id][
                self.user_item_matrix.loc[user_id] != 0
            ].index
        )
        candidate_scores: dict[int, float] = {}

        for similar_user, similarity in similar_users.items():
            for exercise_id, interaction_score in self.user_item_matrix.loc[
                similar_user
            ].items():
                if exercise_id in user_items or interaction_score <= 0:
                    continue

                candidate_scores[exercise_id] = (
                    candidate_scores.get(exercise_id, 0.0)
                    + float(similarity) * float(interaction_score)
                )

        if not candidate_scores:
            return []

        if self.exercises is None:
            self.load_exercises()

        exercise_names = self.exercises.set_index("exercise_id")["title"].to_dict()
        max_score = float(np.max(list(candidate_scores.values())))
        ranked_candidates = sorted(
            candidate_scores.items(),
            key=lambda candidate: candidate[1],
            reverse=True,
        )[:top_n]

        return [
            {
                "exercise_id": int(exercise_id),
                "name": str(exercise_names.get(exercise_id, "Exercise")),
                "score": round(float(score / max_score), 4),
            }
            for exercise_id, score in ranked_candidates
        ]

    @staticmethod
    def _interaction_score(interaction: pd.Series) -> float:
        """Turn persisted behaviour into a collaborative preference signal."""

        action_scores = {
            "VIEWED": 0.2,
            "COMPLETED": 1.0,
            "FAVORITED": 0.8,
            "SKIPPED": -0.8,
            "RATED": 0.0,
        }
        score = action_scores.get(str(interaction["action"]).upper(), 0.0)

        if pd.notna(interaction["rating"]):
            rating_score = (float(interaction["rating"]) - 3) / 2
            score = rating_score if str(interaction["action"]).upper() == "RATED" else (
                score + rating_score * 0.25
            )

        if bool(interaction["completed"]):
            score = max(score, 1.0)

        return score

    @staticmethod
    def _read_database(query: str) -> pd.DataFrame:
        """Read a query with the shared project database environment settings."""

        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
        )

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query)
            rows = cursor.fetchall()

            return pd.DataFrame(rows, columns=cursor.column_names)
        finally:
            if "cursor" in locals():
                cursor.close()
            connection.close()
