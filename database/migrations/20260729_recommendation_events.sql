CREATE TABLE IF NOT EXISTS recommendation_events (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    recommendation_id INT NOT NULL,

    recommendation_type ENUM(
        'exercise',
        'food'
    ) NOT NULL DEFAULT 'exercise',

    event_type ENUM(
        'view',
        'accept',
        'reject',
        'favourite'
    ) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_recommendation_events_user_created (
        user_id,
        created_at
    ),

    CONSTRAINT fk_recommendation_events_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE

);
