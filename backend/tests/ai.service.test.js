jest.mock("../src/config/db", () => ({
    execute: jest.fn(),
}));

const db = require("../src/config/db");
const {
    buildChatMessages,
    getConversationHistory,
    saveConversation,
} = require("../src/services/ai.service");

describe("AI service chat memory", () => {

    beforeEach(() => {
        db.execute.mockReset();
    });

    test("includes recent conversation turns before the current user message", () => {

        const messages = buildChatMessages("What did I do today?", {
            user: { name: "Test User" },
            conversationHistory: [
                {
                    message: "I want to gain muscle.",
                    response: "I can help you build a muscle-gain routine.",
                },
            ],
        });

        expect(messages).toEqual([
            expect.objectContaining({ role: "system" }),
            {
                role: "user",
                content: "I want to gain muscle.",
            },
            {
                role: "assistant",
                content: "I can help you build a muscle-gain routine.",
            },
            {
                role: "user",
                content: "What did I do today?",
            },
        ]);

    });

    test("includes wellness and ML recommendation context in the system prompt", () => {

        const [systemMessage] = buildChatMessages("Suggest a workout", {
            preferences: { fitness_goal: "Muscle Gain" },
            progress: { current_streak: 3 },
            recommendations: {
                exercises: [{ title: "Barbell Squat" }],
            },
        });

        expect(systemMessage.content).toContain("Muscle Gain");
        expect(systemMessage.content).toContain("Barbell Squat");
    });

    test("loads only the most recent message turns for a user", async () => {

        db.execute.mockResolvedValueOnce([[
            { role: "assistant", message: "Second response" },
            { role: "user", message: "Second question" },
        ]]);

        const history = await getConversationHistory(11, 10);

        expect(db.execute).toHaveBeenCalledWith(
            expect.stringContaining("FROM chat_history"),
            [11]
        );
        expect(history).toEqual([
            { role: "user", message: "Second question" },
            { role: "assistant", message: "Second response" },
        ]);
    });

    test("saves separate user and assistant messages", async () => {

        db.execute
            .mockResolvedValueOnce([{ insertId: 91 }])
            .mockResolvedValueOnce([{ insertId: 92 }]);

        const conversation = await saveConversation(
            11,
            "Suggest a workout",
            "Try a beginner strength workout.",
        );

        expect(db.execute).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("INSERT INTO chat_history"),
            [11, "user", "Suggest a workout"]
        );
        expect(db.execute).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("INSERT INTO chat_history"),
            [11, "assistant", "Try a beginner strength workout."]
        );
        expect(conversation).toEqual({ id: 92 });
    });

});
