CREATE TABLE IF NOT EXISTS workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    goal VARCHAR(100) NOT NULL,
    duration_weeks INT NOT NULL DEFAULT 1,
    description TEXT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workout_plans_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    day_number INT NOT NULL,
    sets INT NOT NULL,
    reps VARCHAR(30) NOT NULL,
    duration_minutes INT NOT NULL,

    CONSTRAINT fk_workout_plan_exercises_plan
        FOREIGN KEY (workout_plan_id)
        REFERENCES workout_plans(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_workout_plan_exercises_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE
);
