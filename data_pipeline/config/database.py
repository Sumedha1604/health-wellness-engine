import os


from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from dotenv import load_dotenv
load_dotenv()

def get_database_url() -> str:
    """
    Build the MySQL connection URL from environment variables.
    """

    user = os.getenv("MYSQL_USER", "wellness_user")
    password = os.getenv("MYSQL_PASSWORD", "wellness123")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DATABASE", "health_wellness_db")

    return (
        f"mysql+pymysql://"
        f"{user}:{password}@{host}:{port}/{database}"
    )


def create_db_engine() -> Engine:
    """
    Create a reusable SQLAlchemy engine.
    """

    return create_engine(
        get_database_url(),
        echo=False,
        future=True,
        pool_pre_ping=True,
    )