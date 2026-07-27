const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Recommendation Feedback API", () => {

    test("POST /api/recommendations/feedback should save feedback", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`)
            .send({
                recommendation_type: "exercise",
                recommendation_id: 2876,
                feedback: "like",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Feedback saved successfully"
        );
        expect(response.body.data.id).toBeDefined();

    });

    test("GET /api/recommendations/feedback should return user feedback history", async () => {

        const { token } = await createAuthenticatedUser();

        await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`)
            .send({
                recommendation_type: "food",
                recommendation_id: 42,
                feedback: "dislike",
            });

        const response = await request(app)
            .get("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
            recommendation_type: "food",
            recommendation_id: 42,
            feedback: "dislike",
            recommendation_score: -1,
            viewed: true,
        });

    });

    test("POST /api/recommendations/feedback should record a view event", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`)
            .send({
                recommendation_type: "exercise",
                recommendation_id: 2876,
                feedback: "viewed",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

    });

    test("GET /api/recommendations/feedback/history should return feedback history", async () => {

        const { token } = await createAuthenticatedUser();

        await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`)
            .send({
                recommendation_type: "exercise",
                recommendation_id: 2876,
                feedback: "like",
            });

        const response = await request(app)
            .get("/api/recommendations/feedback/history")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);

    });

    test("POST /api/recommendations/feedback should reject invalid feedback", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/recommendations/feedback")
            .set("Authorization", `Bearer ${token}`)
            .send({
                recommendation_type: "habit",
                recommendation_id: 0,
                feedback: "skip",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

    });

});
