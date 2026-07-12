const request = require("supertest");
const app = require("../src/app");
const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Foods API", () => {

    test("GET /api/foods should return a paginated list of foods", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/foods")
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
    test("GET /api/foods should reject requests without a token", async () => {

        const response = await request(app)
            .get("/api/foods");

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Access token required"
        );

    });
    test("GET /api/foods should support pagination", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/foods?page=1&limit=5")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.page).toBe(1);

        expect(response.body.data.limit).toBe(5);

        expect(Array.isArray(response.body.data.data)).toBe(true);

        expect(response.body.data.data.length).toBeLessThanOrEqual(5);

    });
    test("GET /api/foods/:foodId should return a food", async () => {

        const { token } = await createAuthenticatedUser();

        const foodsResponse = await request(app)
            .get("/api/foods")
            .set("Authorization", `Bearer ${token}`);

        const foodId = foodsResponse.body.data.data[0].food_id;

        const response = await request(app)
            .get(`/api/foods/${foodId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(response.body.data.food_id).toBe(foodId);

    });
    test("GET /api/foods/:foodId should reject an invalid food ID", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/foods/abc")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("GET /api/foods/search should return matching foods", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/foods/search?name=chicken")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe("Success");

        expect(Array.isArray(response.body.data)).toBe(true);

        expect(response.body.data.length).toBeGreaterThan(0);

        expect(
            response.body.data[0]
        ).toHaveProperty("food_id");

        expect(
            response.body.data[0]
        ).toHaveProperty("food_name");

    });
});