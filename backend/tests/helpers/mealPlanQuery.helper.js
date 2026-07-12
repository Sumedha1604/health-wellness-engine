const request = require("supertest");

const app = require("../../src/app");

async function getMealPlans(token) {

    const response = await request(app)
        .get("/api/meal-plans")
        .set("Authorization", `Bearer ${token}`);

    return response.body.data;

}

module.exports = {
    getMealPlans,
};