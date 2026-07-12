const request = require("supertest");

const app = require("../../src/app");

async function createAuthenticatedUser() {

    const email = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

    const password = "Password@123";

    await request(app)
        .post("/api/auth/register")
        .send({
            first_name: "Test",
            last_name: "User",
            email,
            password,
            gender: "Female",
        });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
            email,
            password,
        });

        return {
            token: loginResponse.body.data.token,
            password,
            user: {
                first_name: "Test",
                last_name: "User",
                email,
            },
        };
}

module.exports = {
    createAuthenticatedUser,
};