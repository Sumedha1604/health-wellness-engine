-- Preserve existing conversations while converting history to individual turns.
CREATE TABLE chat_history_normalized (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_history_user_created (user_id, created_at),
    CONSTRAINT fk_chat_history_normalized_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

INSERT INTO chat_history_normalized (user_id, role, message, created_at)
SELECT user_id, 'user', message, created_at
FROM chat_history;

INSERT INTO chat_history_normalized (user_id, role, message, created_at)
SELECT user_id, 'assistant', response, created_at
FROM chat_history;

DROP TABLE chat_history;
RENAME TABLE chat_history_normalized TO chat_history;
