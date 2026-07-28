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
const trackingRoutes = require("./routes/tracking.routes");
const chatRoutes = require("./routes/chat.routes");
const wellnessRoutes = require("./routes/wellness.routes");
const progressRoutes = require("./routes/progress.routes");
const workoutPlanRoutes = require("./routes/workoutPlan.routes");
const errorMiddleware = require("./middleware/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Non-browser clients (health checks, mobile clients, and server-to-server
    // requests) do not send an Origin header.
    if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const corsError = new Error("Origin is not allowed by CORS.");
    corsError.statusCode = 403;
    callback(corsError);
  },
  credentials: true,
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

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
app.use("/api/tracking", trackingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/workout-plans", workoutPlanRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use(errorMiddleware);

module.exports = app;
