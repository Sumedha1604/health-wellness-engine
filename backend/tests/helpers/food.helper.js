const request = require("supertest");

const app = require("../../src/app");

async function getFoodId(token) {

    const response = await request(app)
        .get("/api/foods")
        .set("Authorization", `Bearer ${token}`);

    return response.body.data.data[0].food_id;

}

module.exports = {
    getFoodId,
};