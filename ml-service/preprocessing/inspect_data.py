from pathlib import Path
import pandas as pd


# ==========================================================
# Project Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "datasets" / "raw"

USER_DATASET = RAW_DATA_DIR / "gym_members_exercise_tracking.csv"
EXERCISE_DATASET = RAW_DATA_DIR / "megaGymDataset.csv"

FOOD_DATASETS = [
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP1.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP2.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP3.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP4.csv",
    RAW_DATA_DIR / "FINAL FOOD DATASET" / "FOOD-DATA-GROUP5.csv",
]


# ==========================================================
# Function to inspect a dataset
# ==========================================================

def inspect_dataset(dataset_name: str, file_path: Path):
    """
    Load a dataset and print useful information.
    """

    print("\n" + "=" * 80)
    print(f"DATASET: {dataset_name}")
    print("=" * 80)

    try:
        df = pd.read_csv(file_path)

        print(f"\nFile: {file_path.name}")

        print("\nShape")
        print(df.shape)

        print("\nColumns")
        print(df.columns.tolist())

        print("\nData Types")
        print(df.dtypes)

        print("\nMissing Values")
        print(df.isnull().sum())

        print("\nDuplicate Rows")
        print(df.duplicated().sum())

        print("\nFirst 5 Rows")
        print(df.head())

    except Exception as error:
        print(f"\nError reading {file_path}")
        print(error)


# ==========================================================
# Main
# ==========================================================

def main():

    inspect_dataset(
        "Gym Members Dataset",
        USER_DATASET
    )

    inspect_dataset(
        "Exercise Catalog Dataset",
        EXERCISE_DATASET
    )

    for index, dataset in enumerate(FOOD_DATASETS, start=1):

        inspect_dataset(
            f"Food Dataset Group {index}",
            dataset
        )


if __name__ == "__main__":
    main()