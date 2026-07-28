const request = require("supertest");

const app = require("../src/app");
const db = require("../src/config/db");

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

    return response.body.data.data[0]?.exercise_id;
}

describe("User History API", () => {

    test("GET /api/history returns empty records for a new user", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/history?period=today")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            period: "today",
            nutrition: [],
            exercises: [],
            water: [],
            workout_plans: [],
        });

    });

    test("GET /api/history returns a user's created tracking records and plans", async () => {

        const { token, user } = await createAuthenticatedUser();
        const [foodId, exerciseId] = await Promise.all([
            getFoodId(token),
            getExerciseId(token),
        ]);

        const waterResponse = await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({ amount_ml: 500 });

        const nutritionResponse = await request(app)
            .post("/api/tracking/nutrition")
            .set("Authorization", `Bearer ${token}`)
            .send({ food_id: foodId, quantity: 1 });

        if (exerciseId) {
            await request(app)
                .post("/api/tracking/exercise")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    exercise_id: exerciseId,
                    duration_minutes: 30,
                    calories_burned: 180,
                });
        }

        await db.execute(
            `
            INSERT INTO workout_plans (user_id, title, goal, duration_weeks)
            VALUES (?, ?, ?, ?)
            `,
            [
                user.user_id,
                "History Test Plan",
                "Improve Endurance",
                1,
            ]
        );

        const response = await request(app)
            .get("/api/history?period=today")
            .set("Authorization", `Bearer ${token}`);

        expect(waterResponse.statusCode).toBe(201);
        expect(nutritionResponse.statusCode).toBe(201);
        expect(response.statusCode).toBe(200);
        expect(response.body.data.water).toEqual([
            expect.objectContaining({ amount_ml: 500 }),
        ]);
        expect(response.body.data.nutrition).toEqual([
            expect.objectContaining({ food_id: foodId, quantity: 1 }),
        ]);
        expect(response.body.data.workout_plans).toEqual([
            expect.objectContaining({ title: "History Test Plan" }),
        ]);

        if (exerciseId) {
            expect(response.body.data.exercises).toEqual([
                expect.objectContaining({ exercise_id: exerciseId }),
            ]);
        }

    });

    test("history filters records by today, last 7 days, and last 30 days", async () => {

        const { token } = await createAuthenticatedUser();

        const waterResponse = await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({ amount_ml: 750 });

        await db.execute(
            `
            UPDATE water_logs
            SET logged_at = DATE_SUB(CURDATE(), INTERVAL 8 DAY)
            WHERE id = ?
            `,
            [waterResponse.body.data.id]
        );

        const [todayResponse, last7Response, last30Response] = await Promise.all([
            request(app)
                .get("/api/history?period=today")
                .set("Authorization", `Bearer ${token}`),
            request(app)
                .get("/api/history?period=last7days")
                .set("Authorization", `Bearer ${token}`),
            request(app)
                .get("/api/history?period=last30days")
                .set("Authorization", `Bearer ${token}`),
        ]);

        expect(todayResponse.body.data.water).toHaveLength(0);
        expect(last7Response.body.data.water).toHaveLength(0);
        expect(last30Response.body.data.water).toEqual([
            expect.objectContaining({ amount_ml: 750 }),
        ]);

    });

    test("history only returns records belonging to the authenticated user", async () => {

        const [firstUser, secondUser] = await Promise.all([
            createAuthenticatedUser(),
            createAuthenticatedUser(),
        ]);

        await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${firstUser.token}`)
            .send({ amount_ml: 250 });

        await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${secondUser.token}`)
            .send({ amount_ml: 900 });

        await db.execute(
            `
            INSERT INTO workout_plans (user_id, title, goal, duration_weeks)
            VALUES (?, ?, ?, ?)
            `,
            [
                secondUser.user.user_id,
                "Other User Plan",
                "Muscle Gain",
                1,
            ]
        );

        const response = await request(app)
            .get("/api/history?period=today")
            .set("Authorization", `Bearer ${firstUser.token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data.water).toEqual([
            expect.objectContaining({ amount_ml: 250 }),
        ]);
        expect(response.body.data.workout_plans).toEqual([]);

    });

    test("history validates the requested period and requires authentication", async () => {

        const { token } = await createAuthenticatedUser();

        const [invalidResponse, unauthorizedResponse] = await Promise.all([
            request(app)
                .get("/api/history?period=alltime")
                .set("Authorization", `Bearer ${token}`),
            request(app).get("/api/history"),
        ]);

        expect(invalidResponse.statusCode).toBe(400);
        expect(invalidResponse.body.message).toBe("Validation failed");
        expect(unauthorizedResponse.statusCode).toBe(401);

    });

});
