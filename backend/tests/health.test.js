const request = require("supertest");

const app = require("../src/app");

describe("Health API", () => {

    test("GET /health should return API health status", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "healthy",
        });

    });

});