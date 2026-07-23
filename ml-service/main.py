from fastapi import FastAPI

from api.recommendations import router


app = FastAPI(
    title="Health Wellness ML Service"
)


app.include_router(
    router,
    prefix="/recommendations"
)


@app.get("/")
def health_check():
    return {
        "status": "ML service running"
    }