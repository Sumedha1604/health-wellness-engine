const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

const {
    getFoodId,
} = require("./helpers/food.helper");

const {
    createMealPlan,
} = require("./helpers/mealPlan.helper");

test("POST /api/meal-plans should create a meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    const response = await request(app)
        .post("/api/meal-plans")
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
            meal_type: "Breakfast",
            meal_date: "2026-07-11",
            quantity: 2
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Meal added successfully"
    );

});
test("GET /api/meal-plans should return all meal plans", async () => {

    const { token } = await createAuthenticatedUser();

    await createMealPlan(token, {
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 2
    });

    const response = await request(app)
        .get("/api/meal-plans")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Success");

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThan(0);

});
test("GET /api/meal-plans/:mealPlanId should return a meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const mealPlanId = await createMealPlan(token, {
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 2
    });

    const response = await request(app)
        .get(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Success");

    expect(response.body.data.meal_plan_id).toBe(mealPlanId);

});
test("PUT /api/meal-plans/:mealPlanId should update a meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    const mealPlanId = await createMealPlan(token, {
        food_id: foodId,
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 1
    });

    const response = await request(app)
        .put(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
            meal_type: "Lunch",
            meal_date: "2026-07-12",
            quantity: 3
        });

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Meal plan updated successfully"
    );

});
test("PUT /api/meal-plans/:mealPlanId should persist updated values", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    const mealPlanId = await createMealPlan(token, {
        food_id: foodId,
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 1
    });

    await request(app)
        .put(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
            meal_type: "Dinner",
            meal_date: "2026-07-13",
            quantity: 4
        });

    const response = await request(app)
        .get(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data.meal_type).toBe("Dinner");

    expect(response.body.data.quantity).toBe(4);

});
test("DELETE /api/meal-plans/:mealPlanId should delete a meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const mealPlanId = await createMealPlan(token, {
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 1
    });

    const response = await request(app)
        .delete(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Meal plan deleted successfully"
    );

});
test("DELETE /api/meal-plans/:mealPlanId should remove the meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const mealPlanId = await createMealPlan(token, {
        meal_type: "Breakfast",
        meal_date: "2026-07-11",
        quantity: 1
    });

    await request(app)
        .delete(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
        .get(`/api/meal-plans/${mealPlanId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Meal plan not found"
    );

});
test("GET /api/meal-plans should reject requests without a token", async () => {

    const response = await request(app)
        .get("/api/meal-plans");

    expect(response.statusCode).toBe(401);

    expect(response.body.error).toBe(
        "Access token required"
    );

});
test("GET /api/meal-plans/:mealPlanId should reject an invalid ID", async () => {

    const { token } = await createAuthenticatedUser();

    const response = await request(app)
        .get("/api/meal-plans/abc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Validation failed");

    expect(response.body.errors).toBeDefined();

});
test("GET /api/meal-plans/:mealPlanId should return 404 for a non-existent meal plan", async () => {

    const { token } = await createAuthenticatedUser();

    const response = await request(app)
        .get("/api/meal-plans/999999")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Meal plan not found"
    );

});
test("GET /api/dashboard/today should return today's nutrition summary", async () => {

    const { token } = await createAuthenticatedUser();

    const response = await request(app)
        .get("/api/dashboard/today")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Success");

    expect(response.body.data).toBeDefined();

});
test("GET /api/dashboard/today should reject requests without a token", async () => {

    const response = await request(app)
        .get("/api/dashboard/today");

    expect(response.statusCode).toBe(401);

    expect(response.body.error).toBe(
        "Access token required"
    );

});