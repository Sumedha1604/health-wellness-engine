from models.exercise_recommender import recommend_exercises


result = recommend_exercises(
    exercise_id=1,
    limit=5
)


for item in result:
    print(item)