"""Configurable production entry point for the ML service."""

import os

import uvicorn


def main() -> None:
    """Start the primary FastAPI application with environment configuration."""

    host = os.getenv("ML_SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))

    uvicorn.run("app:app", host=host, port=port)


if __name__ == "__main__":
    main()
