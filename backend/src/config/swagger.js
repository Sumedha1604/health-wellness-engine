const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "Health & Wellness Engine API",
            version: "1.0.0",
            description:
                "REST API documentation for the Health & Wellness Engine",
        },

        servers: [
            {
                url: "http://localhost:5001",
                description: "Local Development Server",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },

            schemas: {
                Recommendation: {
                    type: "object",
                    properties: {
                        fitness_goal: {
                            type: "string",
                            example: "Muscle Gain",
                        },
                        activity_level: {
                            type: "string",
                            example: "Intermediate",
                        },
                        diet_type: {
                            type: "string",
                            example: "High Protein",
                        },
                        daily_calories: {
                            type: "integer",
                            example: 2800,
                        },
                        recommended_workouts: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: [
                                "Bench Press",
                                "Squats",
                                "Deadlifts",
                                "Pull Ups",
                            ],
                        },
                        recommended_foods: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            example: [
                                "Chicken Breast",
                                "Eggs",
                                "Brown Rice",
                                "Greek Yogurt",
                            ],
                        },
                    },
                },
                Dashboard: {
                    type: "object",
                    properties: {
                        user: {
                            type: "object",
                            properties: {
                                user_id: {
                                    type: "integer",
                                    example: 1,
                                },
                                first_name: {
                                    type: "string",
                                    example: "Sumedha",
                                },
                                last_name: {
                                    type: "string",
                                    example: "Thakur",
                                },
                                email: {
                                    type: "string",
                                    example: "sumedha@example.com",
                                },
                            },
                        },
                        preferences: {
                            type: "object",
                            properties: {
                                fitness_goal: {
                                    type: "string",
                                    example: "Muscle Gain",
                                },
                                activity_level: {
                                    type: "string",
                                    example: "Intermediate",
                                },
                                diet_type: {
                                    type: "string",
                                    example: "High Protein",
                                },
                                height_cm: {
                                    type: "number",
                                    example: 163,
                                },
                                weight_kg: {
                                    type: "number",
                                    example: 62,
                                },
                            },
                        },
                    },
                },
                
                TodaySummary: {
                    type: "object",
                    properties: {
                        date: {
                            type: "string",
                            format: "date",
                            example: "2026-07-10",
                        },
                        meal_count: {
                            type: "integer",
                            example: 3,
                        },
                        total_calories: {
                            type: "number",
                            example: 1850,
                        },
                        total_protein: {
                            type: "number",
                            example: 145,
                        },
                        total_carbohydrates: {
                            type: "number",
                            example: 180,
                        },
                        total_fat: {
                            type: "number",
                            example: 52,
                        },
                        meals: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    meal_type: {
                                        type: "string",
                                        example: "Breakfast",
                                    },
                                    quantity: {
                                        type: "number",
                                        example: 1,
                                    },
                                    food_name: {
                                        type: "string",
                                        example: "Chicken Breast",
                                    },
                                    caloric_value: {
                                        type: "number",
                                        example: 165,
                                    },
                                    protein: {
                                        type: "number",
                                        example: 31,
                                    },
                                    carbohydrates: {
                                        type: "number",
                                        example: 0,
                                    },
                                    fat: {
                                        type: "number",
                                        example: 3.6,
                                    },
                                },
                            },
                        },
                    },
                },
                MealPlanRequest: {
                    type: "object",
                    required: [
                        "food_id",
                        "meal_type",
                        "meal_date",
                        "quantity",
                    ],
                    properties: {
                        food_id: {
                            type: "integer",
                            example: 5305,
                        },
                        meal_type: {
                            type: "string",
                            example: "Breakfast",
                        },
                        meal_date: {
                            type: "string",
                            format: "date",
                            example: "2026-07-10",
                        },
                        quantity: {
                            type: "number",
                            format: "float",
                            example: 1.5,
                        },
                    },
                },
                
                MealPlan: {
                    type: "object",
                    properties: {
                        meal_plan_id: {
                            type: "integer",
                            example: 1,
                        },
                        meal_date: {
                            type: "string",
                            format: "date",
                            example: "2026-07-10",
                        },
                        meal_type: {
                            type: "string",
                            example: "Breakfast",
                        },
                        quantity: {
                            type: "number",
                            example: 1.5,
                        },
                        food_id: {
                            type: "integer",
                            example: 5305,
                        },
                        food_name: {
                            type: "string",
                            example: "Chicken Breast",
                        },
                        caloric_value: {
                            type: "number",
                            example: 165,
                        },
                        protein: {
                            type: "number",
                            example: 31,
                        },
                        carbohydrates: {
                            type: "number",
                            example: 0,
                        },
                        fat: {
                            type: "number",
                            example: 3.6,
                        },
                    },
                },
                Food: {
                    type: "object",
                    properties: {
                        food_id: {
                            type: "integer",
                            example: 1,
                        },
                        food_name: {
                            type: "string",
                            example: "Chicken Breast",
                        },
                        caloric_value: {
                            type: "number",
                            example: 165,
                        },
                        protein: {
                            type: "number",
                            example: 31,
                        },
                        carbohydrates: {
                            type: "number",
                            example: 0,
                        },
                        fat: {
                            type: "number",
                            example: 3.6,
                        },
                    },
                },
                
                FoodListResponse: {
                    type: "object",
                    properties: {
                        page: {
                            type: "integer",
                            example: 1,
                        },
                        limit: {
                            type: "integer",
                            example: 20,
                        },
                        total: {
                            type: "integer",
                            example: 150,
                        },
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Food",
                            },
                        },
                    },
                },
                PreferenceRequest: {
                    type: "object",
                    required: [
                        "fitness_goal",
                        "activity_level",
                        "diet_type",
                        "height_cm",
                        "weight_kg",
                        "sleep_hours",
                        "stress_level",
                    ],
                    properties: {
                        fitness_goal: {
                            type: "string",
                            example: "Muscle Gain",
                        },
                        activity_level: {
                            type: "string",
                            enum: [
                                "Beginner",
                                "Intermediate",
                                "Advanced",
                            ],
                            example: "Intermediate",
                        },
                        diet_type: {
                            type: "string",
                            example: "High Protein",
                        },
                        height_cm: {
                            type: "number",
                            format: "float",
                            example: 163,
                        },
                        weight_kg: {
                            type: "number",
                            format: "float",
                            example: 62,
                        },
                        sleep_hours: {
                            type: "number",
                            format: "float",
                            example: 7.5,
                        },
                        stress_level: {
                            type: "integer",
                            minimum: 1,
                            maximum: 5,
                            example: 3,
                        },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    required: [
                        "first_name",
                        "last_name",
                        "email",
                        "password",
                        "gender",
                    ],
                    properties: {
                        first_name: {
                            type: "string",
                            example: "Sumedha",
                        },
                        last_name: {
                            type: "string",
                            example: "Thakur",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "sumedha@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "Password@123",
                        },
                        gender: {
                            type: "string",
                            example: "Female",
                        },
                    },
                },

                LoginRequest: {
                    type: "object",
                    required: [
                        "email",
                        "password",
                    ],
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "Password@123",
                        },
                    },
                },

                User: {
                    type: "object",
                    properties: {
                        user_id: {
                            type: "integer",
                            example: 1,
                        },
                        first_name: {
                            type: "string",
                            example: "Sumedha",
                        },
                        last_name: {
                            type: "string",
                            example: "Thakur",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "sumedha@example.com",
                        },
                        gender: {
                            type: "string",
                            example: "Female",
                        },
                    },
                },
                UserProfile: {
                    type: "object",
                    properties: {
                        user_id: {
                            type: "integer",
                            example: 1,
                        },
                        first_name: {
                            type: "string",
                            example: "Sumedha",
                        },
                        last_name: {
                            type: "string",
                            example: "Thakur",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "sumedha@example.com",
                        },
                        gender: {
                            type: "string",
                            example: "Female",
                        },
                        fitness_goal: {
                            type: "string",
                            example: "Muscle Gain",
                        },
                        activity_level: {
                            type: "string",
                            example: "Intermediate",
                        },
                        diet_type: {
                            type: "string",
                            example: "High Protein",
                        },
                        height_cm: {
                            type: "string",
                            example: "163.00",
                        },
                        weight_kg: {
                            type: "string",
                            example: "62.00",
                        },
                        sleep_hours: {
                            type: "string",
                            example: "7.5",
                        },
                        stress_level: {
                            type: "integer",
                            example: 3,
                        },
                    },
                },
    
                AuthResponse: {
                    type: "object",
                    properties: {
                        token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        },
                        user: {
                            $ref: "#/components/schemas/User",
                        },
                    },
                },

                SuccessResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true,
                        },
                        message: {
                            type: "string",
                            example: "Request successful.",
                        },
                        data: {
                            type: "object",
                        },
                    },
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: false,
                        },
                        message: {
                            type: "string",
                            example: "Something went wrong.",
                        },
                    },
                },
            },
        },

        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: [
        "./src/routes/*.js",
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;