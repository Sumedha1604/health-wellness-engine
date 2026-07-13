const request = require("supertest");

const app = require("../../src/app");

const {
    getFoodId,
} = require("./food.helper");

async function createMealPlan(token, overrides = {}) {

    const foodId = await getFoodId(token);

    const mealPlan = {
        food_id: foodId,
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 2,
        ...overrides,
    };

    const response = await request(app)
        .post("/api/meal-plans")
        .set("Authorization", `Bearer ${token}`)
        .send(mealPlan);

    expect(response.statusCode).toBe(201);

    const mealPlansResponse = await request(app)
        .get("/api/meal-plans")
        .set("Authorization", `Bearer ${token}`);

    return mealPlansResponse.body.data[0].meal_plan_id;
}

module.exports = {
    createMealPlan,
};