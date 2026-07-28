ALTER TABLE exercise_logs
    ADD INDEX idx_exercise_logs_user_completed_at (
        user_id,
        completed_at
    );

ALTER TABLE water_logs
    ADD INDEX idx_water_logs_user_logged_at (
        user_id,
        logged_at
    );

ALTER TABLE nutrition_logs
    ADD INDEX idx_nutrition_logs_user_logged_at (
        user_id,
        logged_at
    );

ALTER TABLE workout_plans
    ADD INDEX idx_workout_plans_user_created_at (
        user_id,
        created_at
    );
