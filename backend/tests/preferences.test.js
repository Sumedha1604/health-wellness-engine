const request = require("supertest");

const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

describe("Preferences API", () => {

    test("POST /api/preferences should save user preferences", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
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

        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe(
            "Preferences saved successfully"
        );

    });
    test("POST /api/preferences should reject requests without a token", async () => {

        const response = await request(app)
            .post("/api/preferences")
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 62,
                sleep_hours: 7.5,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(401);

        expect(response.body.error).toBe(
            "Access token required"
        );

    });
    test("POST /api/preferences should reject a missing fitness goal", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 62,
                sleep_hours: 7.5,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("POST /api/preferences should reject an invalid activity level", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Expert",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 62,
                sleep_hours: 7.5,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("POST /api/preferences should reject an invalid height", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 40,
                weight_kg: 62,
                sleep_hours: 7.5,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("POST /api/preferences should reject an invalid weight", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 10,
                sleep_hours: 7.5,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("POST /api/preferences should reject invalid sleep hours", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 62,
                sleep_hours: 30,
                stress_level: 3,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });
    test("POST /api/preferences should reject an invalid stress level", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/preferences")
            .set("Authorization", `Bearer ${token}`)
            .send({
                fitness_goal: "Muscle Gain",
                activity_level: "Intermediate",
                diet_type: "High Protein",
                height_cm: 163,
                weight_kg: 62,
                sleep_hours: 7.5,
                stress_level: 10,
            });

        expect(response.statusCode).toBe(400);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe("Validation failed");

        expect(response.body.errors).toBeDefined();

    });

});