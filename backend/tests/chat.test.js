const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Chat API", () => {

    beforeAll(() => {
        delete process.env.AI_API_KEY;
    });

    test("POST /api/chat should return a fallback wellness response", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
                message: "How can I improve my fitness?",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data.reply).toBe("string");
        expect(response.body.data.reply.length).toBeGreaterThan(0);

    });

    test("POST /api/chat should reject an empty message", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
                message: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

    });

    test("POST /api/chat should require authentication", async () => {

        const response = await request(app)
            .post("/api/chat")
            .send({
                message: "Hello",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe(
            "Access token required"
        );

    });

});
