const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Exercises API", () => {

    test("GET /api/exercises should return a paginated list of exercises", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/exercises")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data).toHaveProperty("page");

        expect(response.body.data).toHaveProperty("limit");

        expect(response.body.data).toHaveProperty("total");

        expect(response.body.data).toHaveProperty("data");

        expect(Array.isArray(response.body.data.data)).toBe(true);

    });

    test("GET /api/exercises should reject requests without a token", async () => {

        const response = await request(app)
            .get("/api/exercises");

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Access token required"
        );

    });

    test("GET /api/exercises should support pagination", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/exercises?page=1&limit=5")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.page).toBe(1);

        expect(response.body.data.limit).toBe(5);

        expect(Array.isArray(response.body.data.data)).toBe(true);

        expect(response.body.data.data.length).toBeLessThanOrEqual(5);

    });

    test("GET /api/exercises should support filtering by search, body_part, equipment, and difficulty", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get(
                "/api/exercises?search=push&body_part=Chest&equipment=Body%20Only&difficulty=Beginner"
            )
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toHaveProperty("data");

        expect(Array.isArray(response.body.data.data)).toBe(true);

    });

    test("GET /api/exercises/:id should return an exercise when exercise data exists", async () => {

        const { token } = await createAuthenticatedUser();

        const exercisesResponse = await request(app)
            .get("/api/exercises?limit=1")
            .set("Authorization", `Bearer ${token}`);

        expect(exercisesResponse.statusCode).toBe(200);

        const exercises = exercisesResponse.body.data.data;

        if (!Array.isArray(exercises) || exercises.length === 0) {

            // No exercise records are seeded in this environment
            // (e.g. a fresh CI database). Skip the id-specific
            // assertions instead of depending on seed data.
            return;

        }

        const exerciseId = exercises[0].exercise_id;

        const response = await request(app)
            .get(`/api/exercises/${exerciseId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data.exercise_id).toBe(exerciseId);

    });

    test("GET /api/exercises/:id should return 404 for a non-existent exercise", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/exercises/999999")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "Exercise not found."
        );

    });

    test("GET /api/exercises/:id should reject requests without a token", async () => {

        const response = await request(app)
            .get("/api/exercises/1");

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Access token required"
        );

    });

});