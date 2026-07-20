-- =====================================================
-- Health & Wellness Recommendation Engine Database
-- =====================================================

DROP TABLE IF EXISTS recommendation_logs;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS workouts;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS users;

CREATE TABLE users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(50) NOT NULL,

    last_name VARCHAR(50) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    gender ENUM('Male','Female','Other'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);
CREATE TABLE preferences (

    preference_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    fitness_goal ENUM(
        'Weight Loss',
        'Muscle Gain',
        'Maintain Weight',
        'Improve Endurance'
    ) NOT NULL,

    activity_level ENUM(
        'Beginner',
        'Intermediate',
        'Advanced'
    ) NOT NULL,

    diet_type ENUM(
        'Vegetarian',
        'Vegan',
        'Keto',
        'High Protein',
        'Balanced'
    ) NOT NULL,

    height_cm DECIMAL(5,2),

    weight_kg DECIMAL(5,2),

    sleep_hours DECIMAL(3,1),

    stress_level INT,

    updated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
CREATE TABLE exercises (

    exercise_id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    exercise_type VARCHAR(100),

    body_part VARCHAR(100),

    equipment VARCHAR(100),

    difficulty_level VARCHAR(50),

    rating DECIMAL(3,2),

    rating_description VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
CREATE TABLE foods (

    food_id INT AUTO_INCREMENT PRIMARY KEY,

    food_name VARCHAR(255) NOT NULL,

    caloric_value DECIMAL(8,2),

    fat DECIMAL(8,2),

    saturated_fats DECIMAL(8,2),

    monounsaturated_fats DECIMAL(8,2),

    polyunsaturated_fats DECIMAL(8,2),

    carbohydrates DECIMAL(8,2),

    sugars DECIMAL(8,2),

    protein DECIMAL(8,2),

    dietary_fiber DECIMAL(8,2),

    cholesterol DECIMAL(8,2),

    sodium DECIMAL(8,2),

    water DECIMAL(8,2),

    vitamin_a DECIMAL(10,2),

    vitamin_b1 DECIMAL(10,2),

    vitamin_b11 DECIMAL(10,2),

    vitamin_b12 DECIMAL(10,2),

    vitamin_b2 DECIMAL(10,2),

    vitamin_b3 DECIMAL(10,2),

    vitamin_b5 DECIMAL(10,2),

    vitamin_b6 DECIMAL(10,2),

    vitamin_c DECIMAL(10,2),

    vitamin_d DECIMAL(10,2),

    vitamin_e DECIMAL(10,2),

    vitamin_k DECIMAL(10,2),

    calcium DECIMAL(10,2),

    copper DECIMAL(10,2),

    iron DECIMAL(10,2),

    magnesium DECIMAL(10,2),

    manganese DECIMAL(10,2),

    phosphorus DECIMAL(10,2),

    potassium DECIMAL(10,2),

    selenium DECIMAL(10,2),

    zinc DECIMAL(10,2),

    nutrition_density DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
CREATE TABLE workouts (

    workout_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    exercise_id INT NOT NULL,

    workout_date DATE NOT NULL,

    duration_minutes INT,

    calories_burned DECIMAL(8,2),

    completed BOOLEAN DEFAULT TRUE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workout_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_workout_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE

);
CREATE TABLE meal_plans (

    meal_plan_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    food_id INT NOT NULL,

    meal_type ENUM(
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snack'
    ) NOT NULL,

    meal_date DATE NOT NULL,

    quantity DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_mealplans_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mealplans_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
        ON DELETE CASCADE

);
CREATE TABLE favorites (

    favorite_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    exercise_id INT NULL,

    food_id INT NULL,

    meal_plan_id INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorite_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorite_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_favorite_meal_plan
    FOREIGN KEY (meal_plan_id)
    REFERENCES meal_plans(meal_plan_id)
    ON DELETE CASCADE

);
CREATE TABLE recommendations (

    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    recommendation_type ENUM(
        'Exercise',
        'Food',
        'Meditation',
        'Habit'
    ) NOT NULL,

    exercise_id INT NULL,

    food_id INT NULL,

    recommendation_score DECIMAL(5,4) NOT NULL,

    recommendation_reason TEXT,

    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendation_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_food
        FOREIGN KEY (food_id)
        REFERENCES foods(food_id)
        ON DELETE CASCADE

);
CREATE TABLE recommendation_logs (

    log_id INT AUTO_INCREMENT PRIMARY KEY,

    recommendation_id INT NOT NULL,

    viewed BOOLEAN DEFAULT FALSE,

    clicked BOOLEAN DEFAULT FALSE,

    accepted BOOLEAN DEFAULT FALSE,

    completed BOOLEAN DEFAULT FALSE,

    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_recommendation
        FOREIGN KEY (recommendation_id)
        REFERENCES recommendations(recommendation_id)
        ON DELETE CASCADE

);