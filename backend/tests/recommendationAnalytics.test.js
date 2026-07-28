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


describe("Recommendation Analytics API", () => {

    test("GET /api/recommendations/analytics returns only the user's activity", async () => {

        const firstUser = await createAuthenticatedUser();
        const secondUser = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(firstUser.token);

        await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${firstUser.token}`)
            .send({
                exercise_id: exerciseId,
                action: "VIEWED",
            });

        await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${firstUser.token}`)
            .send({
                exercise_id: exerciseId,
                action: "FAVORITED",
            });

        await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${firstUser.token}`)
            .send({
                recommendation_type: "exercise",
                recommendation_id: exerciseId,
                feedback: "like",
            });

        await request(app)
            .post("/api/recommendations/interactions")
            .set("Authorization", `Bearer ${secondUser.token}`)
            .send({
                exercise_id: exerciseId,
                action: "SKIPPED",
            });

        const response = await request(app)
            .get("/api/recommendations/analytics")
            .set("Authorization", `Bearer ${firstUser.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
            total_recommendations_viewed: 1,
            accepted_recommendations: 1,
            rejected_recommendations: 0,
            favourite_recommendations: 1,
        });
        expect(response.body.data.most_recommended_exercise_categories).toHaveLength(1);
        expect(response.body.data.interaction_history).toHaveLength(3);

    });

    test("GET /api/recommendations/analytics returns an empty summary for new users", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/recommendations/analytics")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toMatchObject({
            total_recommendations_viewed: 0,
            accepted_recommendations: 0,
            rejected_recommendations: 0,
            favourite_recommendations: 0,
            most_recommended_exercise_categories: [],
            interaction_history: [],
        });

    });

    test("GET /api/recommendations/analytics requires authentication", async () => {

        const response = await request(app)
            .get("/api/recommendations/analytics");

        expect(response.statusCode).toBe(401);

    });

});
