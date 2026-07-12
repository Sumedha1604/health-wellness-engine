# Backend Integration Tests

This directory contains the integration tests for the Health & Wellness Engine backend.

The tests use:

- Jest
- Supertest
- Express
- MySQL Test Database

All tests are located inside the `tests/` directory.

---

# Directory Structure

```
tests/
│
├── helpers/
│   ├── auth.helper.js
│   ├── food.helper.js
│   ├── mealPlan.helper.js
│   └── preference.helper.js
│
├── auth.test.js
├── dashboard.test.js
├── favorites.test.js
├── foods.test.js
├── health.test.js
├── mealPlans.test.js
├── preferences.test.js
├── recommendations.test.js
├── users.test.js
└── setup.js
```

---

# Running the Tests

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npm test -- auth.test.js
```

Example:

```bash
npm test -- mealPlans.test.js
```

Watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in:

```
coverage/
```

Open the HTML report:

```
coverage/lcov-report/index.html
```

---

# Test Helpers

To reduce duplicate setup code, reusable helper functions are provided.

## auth.helper.js

Creates a new user, logs them in, and returns an authentication token.

Example:

```javascript
const {
    token,
    user,
} = await createAuthenticatedUser();
```

Returns:

```javascript
{
    token,
    user
}
```

---

## food.helper.js

Retrieves an existing food ID from the database.

Example:

```javascript
const foodId = await getFoodId(token);
```

Returns:

```javascript
foodId
```

---

## mealPlan.helper.js

Creates a meal plan for the authenticated user.

Example:

```javascript
const mealPlanId = await createMealPlan(token);
```

Override default values:

```javascript
const mealPlanId = await createMealPlan(token, {
    meal_type: "Lunch",
    quantity: 3
});
```

Returns:

```javascript
mealPlanId
```

---

## preference.helper.js

Creates default user preferences.

Example:

```javascript
await savePreferences(token);
```

Override values:

```javascript
await savePreferences(token, {
    fitness_goal: "Weight Loss"
});
```

---

# Test Structure

Each test follows the Arrange → Act → Assert pattern.

Example:

```javascript
test("GET /api/users/profile should return the authenticated user's profile", async () => {

    // Arrange
    const { token } = await createAuthenticatedUser();

    // Act
    const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

});
```

---

# Test Naming Convention

Use descriptive names.

Good:

```
GET /api/users/profile should return the authenticated user's profile
```

Bad:

```
Profile Test
```

---

# Adding a New Test

1. Create a new test file inside `tests/`.

2. Import the required helpers.

Example:

```javascript
const request = require("supertest");
const app = require("../src/app");

const {
    createAuthenticatedUser,
} = require("./helpers/auth.helper");
```

3. Keep tests independent.

Each test should create its own data and should not depend on another test.

4. Use helper functions whenever possible to reduce duplicate setup code.

5. Follow the Arrange → Act → Assert structure.

---

# Coverage

Coverage is measured using Jest.

Current thresholds:

- Statements: 80%
- Functions: 80%
- Lines: 80%
- Branches: 65%

Run:

```bash
npm run test:coverage
```

to generate an updated coverage report.

---

# Notes

- Tests are designed to be independent.
- Each test creates its own user and test data.
- Authentication uses JWT tokens generated during the test.
- Test helpers are intended only for repeated setup code.
- The actual endpoint under test should always remain explicit inside each test.