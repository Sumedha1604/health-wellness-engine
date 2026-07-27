const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

async function createPreferences(token) {

    await request(app)
        .post("/api/preferences")
        .set("Authorization", `Bearer ${token}`)
        .send({
            fitness_goal: "Muscle Gain",
            activity_level: "Beginner",
            diet_type: "Balanced",
            height_cm: 170,
            weight_kg: 65,
            sleep_hours: 8,
            stress_level: 4,
        });

}

describe("Workout Plans API", () => {

    test("GET /api/workout-plans returns an empty plan list", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/workout-plans")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual([]);

    });

    test("workout plans require authentication", async () => {

        const response = await request(app)
            .get("/api/workout-plans");

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Access token required");

    });

    test("POST generate creates, retrieves, and completes a workout plan", async () => {

        const { token } = await createAuthenticatedUser();
        await createPreferences(token);

        const generateResponse = await request(app)
            .post("/api/workout-plans/generate")
            .set("Authorization", `Bearer ${token}`);

        expect(generateResponse.statusCode).toBe(201);
        expect(generateResponse.body.data).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                goal: "Muscle Gain",
                exercises: expect.any(Array),
            })
        );
        expect(generateResponse.body.data.exercises.length).toBeGreaterThan(0);

        const planId = generateResponse.body.data.id;
        const detailResponse = await request(app)
            .get(`/api/workout-plans/${planId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(detailResponse.statusCode).toBe(200);
        expect(detailResponse.body.data.exercises.length).toBeGreaterThan(0);

        const completeResponse = await request(app)
            .post(`/api/workout-plans/${planId}/complete`)
            .set("Authorization", `Bearer ${token}`);

        expect(completeResponse.statusCode).toBe(200);
        expect(completeResponse.body.message).toBe(
            "Workout plan completed successfully"
        );

    });

});
