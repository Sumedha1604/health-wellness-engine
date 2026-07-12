const request = require("supertest");

const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Dashboard API", () => {

    test("GET /api/dashboard should return dashboard data", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/dashboard")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data).toBeDefined();

    });
    test("GET /api/dashboard should reject requests without a token", async () => {

        const response = await request(app)
            .get("/api/dashboard");
    
        expect(response.statusCode).toBe(401);
    
        expect(response.body.error).toBe(
            "Access token required"
        );
    
    });

});