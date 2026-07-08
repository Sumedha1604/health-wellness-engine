from pathlib import Path

import pandas as pd
from sqlalchemy import text

from data_pipeline.config.database import create_db_engine


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = (
    PROJECT_ROOT
    / "ml-service"
    / "datasets"
    / "processed"
    / "exercises.csv"
)


def load_data() -> pd.DataFrame:
    """
    Load the cleaned exercise dataset.
    """

    df = pd.read_csv(CSV_PATH)

    return df

def clean_value(value):
    """
    Convert Pandas NaN values to None for MySQL.
    """
    return None if pd.isna(value) else value

def import_exercises(df: pd.DataFrame) -> None:
    """
    Insert exercises into MySQL.
    """

    engine = create_db_engine()

    insert_query = text("""
        INSERT INTO exercises
        (
            title,
            description,
            exercise_type,
            body_part,
            equipment,
            difficulty_level,
            rating,
            rating_description
        )

        VALUES
        (
            :title,
            :description,
            :exercise_type,
            :body_part,
            :equipment,
            :difficulty_level,
            :rating,
            :rating_description
        )
    """)

    with engine.begin() as connection:

        for _, row in df.iterrows():

            connection.execute(
                insert_query,
                {
                 "title": clean_value(row["title"]),
                 "description": clean_value(row["desc"]),
                 "exercise_type": clean_value(row["type"]),
                 "body_part": clean_value(row["bodypart"]),
                 "equipment": clean_value(row["equipment"]),
                 "difficulty_level": clean_value(row["level"]),
                 "rating": clean_value(row["rating"]),
                 "rating_description": clean_value(row["ratingdesc"]),
                },
            )


def main():

    print("Loading Exercise Dataset...")

    df = load_data()

    print(f"{len(df)} records loaded.")

    print("Importing into MySQL...")

    import_exercises(df)

    print("Import Complete!")


if __name__ == "__main__":
    main()