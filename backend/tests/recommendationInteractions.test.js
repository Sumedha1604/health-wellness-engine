const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");


async function getExerciseId(token) {

    const response = await request(app)
        .get("/api/exercises?limit=1")
        .set("Authorization", `Bearer ${token}`);

    return response.body.data.data[0].exercise_id;
}


describe("Recommendation Interactions API", () => {

    test("POST /api/recommendations/interactions should save an interaction", async () => {

        const { token } = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(token);

        const response = await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: exerciseId,
                action: "COMPLETED",
                rating: 5,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Recommendation interaction saved successfully"
        );
        expect(response.body.data.id).toBeDefined();

    });

    test("GET /api/recommendations/interactions should return user history", async () => {

        const { token } = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(token);

        await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: exerciseId,
                action: "RATED",
                rating: 4,
            });

        const response = await request(app)
            .get("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
            exercise_id: exerciseId,
            action: "RATED",
            rating: 4,
            completed: false,
        });

    });

    test("POST /api/recommendations/interactions should reject an invalid action", async () => {

        const { token } = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(token);

        const response = await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: exerciseId,
                action: "STARTED",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

    });

    test("POST /api/recommendations/interactions should require authentication", async () => {

        const response = await request(app)
            .post("/api/recommendations/interactions")
            .send({
                exercise_id: 1,
                action: "VIEWED",
            });

        expect(response.statusCode).toBe(401);

    });

});
