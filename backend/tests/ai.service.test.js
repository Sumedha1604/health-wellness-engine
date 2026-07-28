const { buildChatMessages } = require("../src/services/ai.service");

describe("AI service chat memory", () => {

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

});
