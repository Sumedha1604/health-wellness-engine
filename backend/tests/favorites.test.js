const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");

const {
    getFoodId,
} = require("./helpers/food.helper");

test("POST /api/favorites should add a food to favorites", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    const response = await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
        });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Favorite added successfully"
    );

});
test("GET /api/favorites should return the user's favorites", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
        });

    const response = await request(app)
        .get("/api/favorites")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Success");

    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data.length).toBeGreaterThan(0);

});
test("GET /api/favorites should reject requests without a token", async () => {

    const response = await request(app)
        .get("/api/favorites");

    expect(response.statusCode).toBe(401);

    expect(response.body.error).toBe(
        "Access token required"
    );

});
test("DELETE /api/favorites/:favoriteId should delete a favorite", async () => {

    const { token } = await createAuthenticatedUser();

    const foodId = await getFoodId(token);

    await request(app)
        .post("/api/favorites")
        .set("Authorization", `Bearer ${token}`)
        .send({
            food_id: foodId,
        });

    const favoritesResponse = await request(app)
        .get("/api/favorites")
        .set("Authorization", `Bearer ${token}`);

    const favoriteId =
        favoritesResponse.body.data[0].favorite_id;

    const response = await request(app)
        .delete(`/api/favorites/${favoriteId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
        "Favorite deleted successfully"
    );

});
test("DELETE /api/favorites/:favoriteId should reject an invalid favorite ID", async () => {

    const { token } = await createAuthenticatedUser();

    const response = await request(app)
        .delete("/api/favorites/abc")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Validation failed");

    expect(response.body.errors).toBeDefined();

});