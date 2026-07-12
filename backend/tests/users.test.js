const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Users API", () => {

    test("GET /api/users/profile should return the authenticated user's profile", async () => {

        const { token, user } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data.email).toBe(user.email);

        expect(response.body.data.first_name).toBe(user.first_name);

        expect(response.body.data.last_name).toBe(user.last_name);

    });
    test("GET /api/users/profile should reject requests without a token", async () => {

        const response = await request(app)
            .get("/api/users/profile");

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Access token required"
        );

    });
    test("GET /api/users/profile should reject an invalid token", async () => {

        const response = await request(app)
            .get("/api/users/profile")
            .set("Authorization", "Bearer invalid.jwt.token");

        expect(response.statusCode).toBe(403);

        expect(response.body.error).toBe(
            "Invalid or expired token"
        );

    });
});