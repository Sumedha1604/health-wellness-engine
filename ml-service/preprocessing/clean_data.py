from pathlib import Path
import pandas as pd


# ==========================================================
# Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

RAW_DATA_DIR = PROJECT_ROOT / "datasets" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "datasets" / "processed"

PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================================
# File Paths
# ==========================================================

USER_DATASET = RAW_DATA_DIR / "gym_members_exercise_tracking.csv"

EXERCISE_DATASET = RAW_DATA_DIR / "megaGymDataset.csv"

FOOD_FILES = [
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP1.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP2.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP3.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP4.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP5.csv",
]


# ==========================================================
# Helper Function
# ==========================================================

def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert column names into snake_case.
    """

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("(", "", regex=False)
        .str.replace(")", "", regex=False)
        .str.replace("/", "_", regex=False)
    )

    return df


# ==========================================================
# Users Dataset
# ==========================================================

print("\nCleaning Gym Members Dataset...")

users_df = pd.read_csv(USER_DATASET)

users_df = clean_column_names(users_df)

users_df.to_csv(
    PROCESSED_DATA_DIR / "users.csv",
    index=False
)

print("✓ users.csv saved")


# ==========================================================
# Exercise Dataset
# ==========================================================

print("\nCleaning Exercise Dataset...")

exercise_df = pd.read_csv(EXERCISE_DATASET)

exercise_df = clean_column_names(exercise_df)

exercise_df = exercise_df.drop(
    columns=["unnamed:_0"],
    errors="ignore"
)

exercise_df.to_csv(
    PROCESSED_DATA_DIR / "exercises.csv",
    index=False
)

print("✓ exercises.csv saved")


# ==========================================================
# Food Dataset
# ==========================================================

print("\nCleaning Food Dataset...")

food_frames = []

for file in FOOD_FILES:

    df = pd.read_csv(file)

    df = clean_column_names(df)

    df = df.drop(
        columns=[
            "unnamed:_0",
            "unnamed:_0.1"
        ],
        errors="ignore"
    )

    food_frames.append(df)

foods_df = pd.concat(
    food_frames,
    ignore_index=True
)

foods_df = foods_df.drop_duplicates()

foods_df.to_csv(
    PROCESSED_DATA_DIR / "foods.csv",
    index=False
)

print("✓ foods.csv saved")


# ==========================================================
# Summary
# ==========================================================

print("\n" + "=" * 60)

print("Cleaning Completed Successfully!")

print("=" * 60)

print(f"Users Dataset      : {users_df.shape}")

print(f"Exercise Dataset   : {exercise_df.shape}")

print(f"Food Dataset       : {foods_df.shape}")

print("\nProcessed datasets saved in:")

print(PROCESSED_DATA_DIR)