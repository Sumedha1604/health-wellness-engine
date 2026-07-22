from models.food_recommender import recommend_foods


result = recommend_foods(
    food_id=1,
    limit=5
)


for item in result:
    print(item)