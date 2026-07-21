const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const preferenceRoutes = require("./routes/preference.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const foodRoutes = require("./routes/food.routes");
const exerciseRoutes = require("./routes/exercise.routes");
const mealPlanRoutes = require("./routes/mealPlan.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorMiddleware = require("./middleware/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use(errorMiddleware);

module.exports = app;
