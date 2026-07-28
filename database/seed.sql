-- Development-only demo data. This file is applied by the dev-seed Compose
-- service when SEED_DEVELOPMENT_DATA=true; it is never mounted as a MySQL
-- production initialization script.
--
-- Demo login: demo@nourish.local / DemoPassword123!
INSERT INTO users (
    first_name,
    last_name,
    email,
    password_hash,
    gender
)
VALUES (
    'Demo',
    'User',
    'demo@nourish.local',
    '$2b$10$6FbzQYLSgag9/UJ8do7YaOssGu0UBurxzW96oyDeVs/yJaewAg6kG',
    'Other'
)
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    password_hash = VALUES(password_hash),
    gender = VALUES(gender);
