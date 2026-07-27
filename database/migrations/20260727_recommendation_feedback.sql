ALTER TABLE recommendation_feedback
    MODIFY feedback ENUM('like', 'dislike', 'viewed') NOT NULL,
    ADD COLUMN recommendation_score DECIMAL(5,2) NOT NULL DEFAULT 0
        AFTER feedback,
    ADD COLUMN viewed BOOLEAN NOT NULL DEFAULT FALSE
        AFTER recommendation_score;
