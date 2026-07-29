import unittest

from models.food_recommender import recommend_foods


class FoodRecommenderTests(unittest.TestCase):
    def test_legacy_call_keeps_response_contract(self):
        recommendations = recommend_foods(food_id=2396, limit=3)

        self.assertEqual(len(recommendations), 3)
        self.assertEqual(
            set(recommendations[0]),
            {
                "food_id",
                "food_name",
                "caloric_value",
                "protein",
                "carbohydrates",
                "fat",
                "similarity_score",
                "reason",
            },
        )
        self.assertTrue(
            all(0.0 <= item["similarity_score"] <= 1.0 for item in recommendations)
        )

    def test_profile_ranking_matches_nutrition_requirements(self):
        preferences = {
            "fitness_goal": "Muscle Gain",
            "diet_type": "high_protein",
            "calorie_requirement": 450,
            "protein_requirement": 30,
            "carbohydrate_requirement": 35,
        }

        recommendations = recommend_foods(
            food_id=2396,
            limit=5,
            user_preferences=preferences,
        )

        self.assertTrue(all(item["protein"] >= 30 for item in recommendations))
        self.assertTrue(
            all(abs(item["caloric_value"] - 450) <= 50 for item in recommendations)
        )


if __name__ == "__main__":
    unittest.main()
