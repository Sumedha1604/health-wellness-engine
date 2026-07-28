CREATE TABLE IF NOT EXISTS recommendation_interactions (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    exercise_id INT NOT NULL,

    action ENUM(
        'VIEWED',
        'COMPLETED',
        'FAVORITED',
        'SKIPPED',
        'RATED'
    ) NOT NULL,

    rating TINYINT NULL,

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_recommendation_interactions_user_created (
        user_id,
        created_at
    ),

    CONSTRAINT fk_recommendation_interactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_recommendation_interactions_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE

);
