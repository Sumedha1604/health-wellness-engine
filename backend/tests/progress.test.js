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

    return response.body.data.data[0]?.exercise_id;

}

describe("Progress API", () => {

    test("GET /api/progress/overview returns tracking aggregates", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/progress/overview")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual(
            expect.objectContaining({
                total_workouts: 0,
                total_water: 0,
                average_daily_water: 0,
                calories_consumed: 0,
                current_streak: 0,
                goals_completed: 0,
                workouts_this_week: 0,
                goal_progress_percentage: 0,
            })
        );

    });

    test("GET /api/progress/history returns seven days of time-series data", async () => {

        const { token } = await createAuthenticatedUser();

        const response = await request(app)
            .get("/api/progress/history")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(7);
        expect(response.body.data[0]).toEqual(
            expect.objectContaining({
                date: expect.any(String),
                water_ml: 0,
                calories: 0,
                protein: 0,
                workouts: 0,
            })
        );

    });

    test("progress includes water, nutrition, and exercise activity", async () => {

        const { token } = await createAuthenticatedUser();
        const [foodId, exerciseId] = await Promise.all([
            getFoodId(token),
            getExerciseId(token),
        ]);

        await request(app)
            .post("/api/tracking/water")
            .set("Authorization", `Bearer ${token}`)
            .send({ amount_ml: 500 });

        await request(app)
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

        const [overviewResponse, historyResponse] = await Promise.all([
            request(app)
                .get("/api/progress/overview")
                .set("Authorization", `Bearer ${token}`),
            request(app)
                .get("/api/progress/history")
                .set("Authorization", `Bearer ${token}`),
        ]);

        expect(overviewResponse.body.data.total_water).toBe(500);
        expect(overviewResponse.body.data.calories_consumed).toBeGreaterThanOrEqual(0);
        expect(overviewResponse.body.data.current_streak).toBe(1);
        expect(overviewResponse.body.data.workouts_this_week).toBe(
            exerciseId ? 1 : 0
        );
        expect(historyResponse.body.data.at(-1)).toEqual(
            expect.objectContaining({
                water_ml: 500,
                workouts: exerciseId ? 1 : 0,
            })
        );

    });

    test("progress routes require authentication", async () => {

        const response = await request(app)
            .get("/api/progress/overview");

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe("Access token required");

    });

});
