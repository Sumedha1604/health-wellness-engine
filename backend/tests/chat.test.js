const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/db");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Chat API", () => {

    beforeAll(() => {
        delete process.env.AI_API_KEY;
    });

    test("POST /api/chat should return a fallback wellness response", async () => {

        const { token, user } = await createAuthenticatedUser();

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
        expect(response.body.data.timestamp).toEqual(expect.any(String));
        expect(response.body.data.conversation_id).toEqual(expect.any(Number));

        const [[storedUser]] = await db.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [user.email]
        );
        const [history] = await db.execute(
            `
            SELECT role, message
            FROM chat_history
            WHERE user_id = ?
            ORDER BY id ASC
            `,
            [storedUser.user_id]
        );

        expect(history.slice(-2)).toEqual([
            { role: "user", message: "How can I improve my fitness?" },
            { role: "assistant", message: response.body.data.reply },
        ]);
    });

    test("POST /api/chat should respond naturally to a greeting", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
                message: "hi",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.reply).toBe(
            "Hi! How can I help you with your fitness or wellness today?"
        );

    });

    test("POST /api/chat should respond naturally to thanks", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/chat")
            .set("Authorization", `Bearer ${token}`)
            .send({
                message: "thanks",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.data.reply).toBe(
            "You’re welcome! Let me know whenever you’d like help with your wellness routine."
        );

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
