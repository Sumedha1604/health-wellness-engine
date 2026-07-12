const request = require("supertest");

const app = require("../../src/app");

async function savePreferences(token) {

    return await request(app)
        .post("/api/preferences")
        .set("Authorization", `Bearer ${token}`)
        .send({
            fitness_goal: "Muscle Gain",
            activity_level: "Intermediate",
            diet_type: "High Protein",
            height_cm: 163,
            weight_kg: 62,
            sleep_hours: 7.5,
            stress_level: 3,
        });

}

module.exports = {
    savePreferences,
};