const request = require("supertest");
const app = require("../src/app");
const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");
const {
    savePreferences,
} = require("./helpers/preference.helper");

describe("Recommendations API", () => {
    test("GET /api/recommendations should return recommendations", async () => {
        const { token } = await createAuthenticatedUser();

        await savePreferences(token);

        const response = await request(app)
            .get("/api/recommendations")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data).toBeDefined();

    });
    test("GET /api/recommendations should return the expected response structure", async () => {
        const { token } = await createAuthenticatedUser();

        await savePreferences(token);

        const response = await request(app)
            .get("/api/recommendations")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toBeDefined();

        expect(typeof response.body.data).toBe("object");
    });
});