from models.collaborative_filter import recommend_for_user


results = recommend_for_user(
    user_id=626,
    limit=5
)


for item in results:
    print(item)