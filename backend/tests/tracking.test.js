const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

const {
    getFoodId,
} = require("./helpers/food.helper");

async function getExerciseId(token) {

    const response = await request(app)
        .get("/api/exercises?limit=1")
        .set("Authorization", `Bearer ${token}`);

    const exercises = response.body.data.data;

    return exercises[0]?.exercise_id;
}

describe("Tracking API", () => {

    test("GET /api/tracking/water/today should return zero when no water is logged", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/tracking/water/today")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            consumed: 0,
            goal: 2500,
            percentage: 0,
        });

    });

    test("POST /api/tracking/water should add water", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount_ml: 500,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Water logged successfully"
        );
        expect(response.body.data.id).toBeDefined();

    });

    test("POST /api/tracking/water should reject an invalid water amount", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount_ml: 0,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

    });

    test("GET /api/tracking/water/today should return today's water total", async () => {

        const { token } = await createAuthenticatedUser();

        await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount_ml: 500,
            });

        await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount_ml: 1000,
            });

        const response = await request(app)
            .get("/api/tracking/water/today")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({
            consumed: 1500,
            goal: 2500,
            percentage: 60,
        });

    });

    test("POST /api/tracking/exercise should reject invalid tracking data", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .post("/api/tracking/exercise")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: 1,
                duration_minutes: 0,
                calories_burned: -10,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");

    });

    test("POST /api/tracking/exercise should log an exercise", async () => {

        const { token } = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(token);

        if (!exerciseId) {
            return;
        }

        const response = await request(app)
            .post("/api/tracking/exercise")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: exerciseId,
                duration_minutes: 30,
                calories_burned: 200,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Exercise logged successfully"
        );
        expect(response.body.data.id).toBeDefined();

    });

    test("GET /api/tracking/exercise/today should return today's exercise history", async () => {

        const { token } = await createAuthenticatedUser();
        const exerciseId = await getExerciseId(token);

        if (!exerciseId) {
            return;
        }

        await request(app)
            .post("/api/tracking/exercise")
            .set("Authorization", `Bearer ${token}`)
            .send({
                exercise_id: exerciseId,
                duration_minutes: 45,
                calories_burned: 300,
            });

        const response = await request(app)
            .get("/api/tracking/exercise/today")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
            exercise_id: exerciseId,
            duration_minutes: 45,
        });

    });

    test("POST /api/tracking/nutrition should log nutrition", async () => {

        const { token } = await createAuthenticatedUser();
        const foodId = await getFoodId(token);

        const response = await request(app)
            .post("/api/tracking/nutrition")
            .set("Authorization", `Bearer ${token}`)
            .send({
                food_id: foodId,
                quantity: 2,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Nutrition logged successfully"
        );
        expect(response.body.data.id).toBeDefined();

    });

    test("GET /api/tracking/nutrition/today should return today's nutrition logs", async () => {

        const { token } = await createAuthenticatedUser();
        const foodId = await getFoodId(token);

        await request(app)
            .post("/api/tracking/nutrition")
            .set("Authorization", `Bearer ${token}`)
            .send({
                food_id: foodId,
                quantity: 1.5,
            });

        const response = await request(app)
            .get("/api/tracking/nutrition/today")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toMatchObject({
            food_id: foodId,
            quantity: "1.50",
        });

    });

});
