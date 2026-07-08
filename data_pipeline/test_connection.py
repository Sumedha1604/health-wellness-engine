from sqlalchemy import text

from data_pipeline.config.database import create_db_engine

engine = create_db_engine()

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT DATABASE();"))

        print("Connected Successfully!")
        print(result.fetchone())

except Exception as error:
    print(error)