const request = require("supertest");

const app = require("../src/app");

describe("Authentication API", () => {

    test("POST /api/auth/register should register a new user", async () => {

        const email = `jest_${Date.now()}@example.com`;

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Jest",
                last_name: "User",
                email,
                password: "Password@123",
                gender: "Female",
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe(
            "User registered successfully"
        );

        expect(response.body.data.email).toBe(email);

        expect(response.body.data.first_name).toBe("Jest");

        expect(response.body.data.last_name).toBe("User");

    });
    test("POST /api/auth/login should login a registered user", async () => {

        const email = `login_${Date.now()}@example.com`;
    
        const password = "Password@123";
    
        await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Login",
                last_name: "User",
                email,
                password,
                gender: "Female",
            });
    
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password,
            });
    
        expect(response.statusCode).toBe(200);
    
        expect(response.body.success).toBe(true);
    
        expect(response.body.message).toBe(
            "Login successful"
        );
    
        expect(response.body.data.token).toBeDefined();
    
        expect(response.body.data.user.email).toBe(email);
    
    });
    test("POST /api/auth/login should reject an invalid password", async () => {

        const email = `invalid_${Date.now()}@example.com`;
    
        const password = "Password@123";
    
        await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Invalid",
                last_name: "Password",
                email,
                password,
                gender: "Female",
            });
    
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "WrongPassword123",
            });
    
        expect(response.statusCode).toBe(500);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe(
            "Invalid email or password"
        );
    
    });
    test("POST /api/auth/register should reject duplicate email", async () => {

        const email = `duplicate_${Date.now()}@example.com`;
    
        const user = {
            first_name: "Duplicate",
            last_name: "User",
            email,
            password: "Password@123",
            gender: "Female",
        };
    
        await request(app)
            .post("/api/auth/register")
            .send(user);
    
        const response = await request(app)
            .post("/api/auth/register")
            .send(user);
    
        expect(response.statusCode).toBe(500);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe(
            "Email already exists"
        );
    
    });
    test("POST /api/auth/login should reject an invalid email format", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "invalid-email",
                password: "Password@123",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });
    test("POST /api/auth/login should reject a missing password", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "user@example.com",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });
    test("POST /api/auth/register should reject a short password", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Test",
                last_name: "User",
                email: `short_${Date.now()}@example.com`,
                password: "12345",
                gender: "Female",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });
    test("POST /api/auth/register should reject a missing first name", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "",
                last_name: "User",
                email: `firstname_${Date.now()}@example.com`,
                password: "Password@123",
                gender: "Female",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });
    test("POST /api/auth/register should reject a missing last name", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Test",
                last_name: "",
                email: `lastname_${Date.now()}@example.com`,
                password: "Password@123",
                gender: "Female",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });
    test("POST /api/auth/register should reject an invalid gender", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                first_name: "Test",
                last_name: "User",
                email: `gender_${Date.now()}@example.com`,
                password: "Password@123",
                gender: "InvalidGender",
            });
    
        expect(response.statusCode).toBe(400);
    
        expect(response.body.success).toBe(false);
    
        expect(response.body.message).toBe("Validation failed");
    
        expect(response.body.errors).toBeDefined();
    
    });

});