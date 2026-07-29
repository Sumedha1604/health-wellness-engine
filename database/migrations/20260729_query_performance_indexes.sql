-- Indexes selected from production query shapes. MySQL already indexes foreign
-- key columns, so those indexes are not duplicated here.
ALTER TABLE meal_plans
    ADD INDEX idx_meal_plans_user_date_id (user_id, meal_date, meal_plan_id);

ALTER TABLE foods
    ADD INDEX idx_foods_name (food_name);

ALTER TABLE exercises
    ADD INDEX idx_exercises_filters_title (
        body_part, equipment, difficulty_level, title
    );

ALTER TABLE recommendations
    ADD INDEX idx_recommendations_user_recommended_id (
        user_id, recommended_at, recommendation_id
    );

ALTER TABLE recommendation_feedback
    ADD INDEX idx_recommendation_feedback_user_created_id (
        user_id, created_at, id
    );
