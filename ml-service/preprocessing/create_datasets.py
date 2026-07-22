from pathlib import Path
import os
import pandas as pd
import mysql.connector
from dotenv import load_dotenv


# ==========================================================
# Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

ENV_PATH = PROJECT_ROOT / ".env"

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml-service"
    / "datasets"
    / "processed"
)

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================================
# Load Environment
# ==========================================================

load_dotenv(ENV_PATH)


# ==========================================================
# Database Connection
# ==========================================================

connection = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)


print("Connected to MySQL")


# ==========================================================
# Helper
# ==========================================================

def save_dataset(df, filename):

    path = OUTPUT_DIR / filename

    df.to_csv(
        path,
        index=False
    )

    print(f"✓ {filename} created")
    print(f"  Shape: {df.shape}")


# ==========================================================
# Foods Dataset
# ==========================================================

foods_query = """
SELECT
    food_id,
    food_name,
    caloric_value,
    protein,
    carbohydrates,
    fat
FROM foods
"""


foods_df = pd.read_sql(
    foods_query,
    connection
)


save_dataset(
    foods_df,
    "foods.csv"
)


# ==========================================================
# Exercises Dataset
# ==========================================================

exercise_query = """
SELECT
    exercise_id,
    title,
    exercise_type,
    body_part,
    equipment,
    difficulty_level
FROM exercises
"""


exercise_df = pd.read_sql(
    exercise_query,
    connection
)


save_dataset(
    exercise_df,
    "exercises.csv"
)


# ==========================================================
# User Interaction Dataset
# ==========================================================

favorites_query = """
SELECT
    user_id,
    food_id,
    exercise_id
FROM favorites
"""


favorites_df = pd.read_sql(
    favorites_query,
    connection
)


interactions = []


for _, row in favorites_df.iterrows():

    if row["food_id"]:

        interactions.append(
            {
                "user_id": row["user_id"],
                "item_id": row["food_id"],
                "item_type": "food",
                "interaction": 1
            }
        )


    if row["exercise_id"]:

        interactions.append(
            {
                "user_id": row["user_id"],
                "item_id": row["exercise_id"],
                "item_type": "exercise",
                "interaction": 1
            }
        )


interactions_df = pd.DataFrame(
    interactions
)


save_dataset(
    interactions_df,
    "interactions.csv"
)


connection.close()


print("\nDataset generation completed successfully!")