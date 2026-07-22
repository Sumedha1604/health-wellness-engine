from pathlib import Path

import pandas as pd
from sqlalchemy import text

from data_pipeline.config.database import create_db_engine


PROJECT_ROOT = Path(__file__).resolve().parents[2]

FOOD_DIR = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "FINAL FOOD DATASET"
)


def clean_value(value):
    """Convert Pandas NaN values to None."""
    return None if pd.isna(value) else value



def load_data():

    files = list(
        FOOD_DIR.glob("FOOD-DATA-GROUP*.csv")
    )

    frames = []

    for file in files:

        df = pd.read_csv(file)

        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_")
        )

        frames.append(df)


    df = pd.concat(
        frames,
        ignore_index=True
    )

    print(f"Loaded {len(df)} food records.")

    return df



def import_foods(df):

    engine = create_db_engine()

    with engine.begin() as connection:

        connection.execute(
            text("DELETE FROM foods")
        )


        insert_query = text("""
        INSERT INTO foods (
            food_name,
            caloric_value,
            fat,
            saturated_fats,
            monounsaturated_fats,
            polyunsaturated_fats,
            carbohydrates,
            sugars,
            protein,
            dietary_fiber,
            cholesterol,
            sodium,
            water,
            vitamin_a,
            vitamin_b1,
            vitamin_b11,
            vitamin_b12,
            vitamin_b2,
            vitamin_b3,
            vitamin_b5,
            vitamin_b6,
            vitamin_c,
            vitamin_d,
            vitamin_e,
            vitamin_k,
            calcium,
            copper,
            iron,
            magnesium,
            manganese,
            phosphorus,
            potassium,
            selenium,
            zinc,
            nutrition_density
        )
        VALUES (
            :food_name,
            :caloric_value,
            :fat,
            :saturated_fats,
            :monounsaturated_fats,
            :polyunsaturated_fats,
            :carbohydrates,
            :sugars,
            :protein,
            :dietary_fiber,
            :cholesterol,
            :sodium,
            :water,
            :vitamin_a,
            :vitamin_b1,
            :vitamin_b11,
            :vitamin_b12,
            :vitamin_b2,
            :vitamin_b3,
            :vitamin_b5,
            :vitamin_b6,
            :vitamin_c,
            :vitamin_d,
            :vitamin_e,
            :vitamin_k,
            :calcium,
            :copper,
            :iron,
            :magnesium,
            :manganese,
            :phosphorus,
            :potassium,
            :selenium,
            :zinc,
            :nutrition_density
        )
        """)


        records = []


        for _, row in df.iterrows():

            records.append({

                "food_name":
                    clean_value(row["food"]),

                "caloric_value":
                    clean_value(row["caloric_value"]),

                "fat":
                    clean_value(row["fat"]),

                "saturated_fats":
                    clean_value(row["saturated_fats"]),

                "monounsaturated_fats":
                    clean_value(row["monounsaturated_fats"]),

                "polyunsaturated_fats":
                    clean_value(row["polyunsaturated_fats"]),

                "carbohydrates":
                    clean_value(row["carbohydrates"]),

                "sugars":
                    clean_value(row["sugars"]),

                "protein":
                    clean_value(row["protein"]),

                "dietary_fiber":
                    clean_value(row["dietary_fiber"]),

                "cholesterol":
                    clean_value(row["cholesterol"]),

                "sodium":
                    clean_value(row["sodium"]),

                "water":
                    clean_value(row["water"]),

                "vitamin_a":
                    clean_value(row["vitamin_a"]),

                "vitamin_b1":
                    clean_value(row["vitamin_b1"]),

                "vitamin_b11":
                    clean_value(row["vitamin_b11"]),

                "vitamin_b12":
                    clean_value(row["vitamin_b12"]),

                "vitamin_b2":
                    clean_value(row["vitamin_b2"]),

                "vitamin_b3":
                    clean_value(row["vitamin_b3"]),

                "vitamin_b5":
                    clean_value(row["vitamin_b5"]),

                "vitamin_b6":
                    clean_value(row["vitamin_b6"]),

                "vitamin_c":
                    clean_value(row["vitamin_c"]),

                "vitamin_d":
                    clean_value(row["vitamin_d"]),

                "vitamin_e":
                    clean_value(row["vitamin_e"]),

                "vitamin_k":
                    clean_value(row["vitamin_k"]),

                "calcium":
                    clean_value(row["calcium"]),

                "copper":
                    clean_value(row["copper"]),

                "iron":
                    clean_value(row["iron"]),

                "magnesium":
                    clean_value(row["magnesium"]),

                "manganese":
                    clean_value(row["manganese"]),

                "phosphorus":
                    clean_value(row["phosphorus"]),

                "potassium":
                    clean_value(row["potassium"]),

                "selenium":
                    clean_value(row["selenium"]),

                "zinc":
                    clean_value(row["zinc"]),

                "nutrition_density":
                    clean_value(row["nutrition_density"])
            })


        connection.execute(
            insert_query,
            records
        )


    print("Food import completed successfully.")



def main():

    df = load_data()

    import_foods(df)



if __name__ == "__main__":
    main()