const db = require("../src/config/db");

beforeAll(async () => {
    const [[exerciseCount]] = await db.execute(
        "SELECT COUNT(*) AS count FROM exercises"
    );

    if (Number(exerciseCount.count) === 0) {
        await db.execute(
            `
            INSERT INTO exercises (
                title,
                description,
                exercise_type,
                body_part,
                equipment,
                difficulty_level,
                rating
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                "Test Strength Exercise",
                "A deterministic exercise fixture for integration tests.",
                "Strength",
                "Full Body",
                "Body Only",
                "Beginner",
                4.5,
            ]
        );
    }
});

afterAll(async () => {
    await db.end();
});
