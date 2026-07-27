const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Wellness API", () => {

    test("GET /api/wellness/summary should return today's progress", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/wellness/summary")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(
            expect.objectContaining({
                calories: expect.any(Object),
                protein: expect.any(Object),
                water: expect.any(Object),
                exercises_completed: expect.any(Number),
                progress: expect.any(Object),
                insights: expect.any(String),
                suggested_action: expect.any(String),
            })
        );

    });

    test("GET /api/wellness/summary should require authentication", async () => {

        const response = await request(app)
            .get("/api/wellness/summary");

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Access token required");

    });

});
