const db = require("../config/db");
const aiService = require("./ai.service");
const trackingService = require("./tracking.service");

function getDailyTargets(fitnessGoal) {

    if (fitnessGoal === "Muscle Gain") {
        return {
            calories: 2800,
            protein: 120,
            water: 2500,
            exercises: 1,
        };
    }

    if (fitnessGoal === "Weight Loss") {
        return {
            calories: 1800,
            protein: 80,
            water: 2500,
            exercises: 1,
        };
    }

    return {
        calories: 2200,
        protein: 80,
        water: 2500,
        exercises: 1,
    };
}

function getFallbackInsight(summary) {

    if (summary.protein.percentage < 70) {
        return "Your protein intake is below your daily target. Add a protein-rich food to your next meal.";
    }

    if (summary.water.percentage < 70) {
        return "You are behind your hydration goal today. Drink some water now and keep a bottle nearby.";
    }

    if (summary.exercises_completed === 0) {
        return "You have not logged a workout today. A short walk or a quick strength session is a great next step.";
    }

    return "You are making steady progress today. Keep your meals, hydration, and movement consistent.";
}

async function getDailyWellnessSummary(userId) {

    const [
        [preferencesRows],
        nutritionLogs,
        water,
        exerciseLogs,
    ] = await Promise.all([
        db.execute(
            `
            SELECT
                fitness_goal,
                activity_level
            FROM preferences
            WHERE user_id = ?
            `,
            [userId]
        ),
        trackingService.getTodayNutritionLogs(userId),
        trackingService.getTodayWater(userId),
        trackingService.getTodayExerciseLogs(userId),
    ]);

    const preferences = preferencesRows[0] || null;
    const targets = getDailyTargets(preferences?.fitness_goal);
    const nutrition = nutritionLogs.reduce(
        (totals, log) => {
            const quantity = Number(log.quantity) || 0;

            return {
                calories: totals.calories +
                    (Number(log.caloric_value) || 0) * quantity,
                protein: totals.protein +
                    (Number(log.protein) || 0) * quantity,
            };
        },
        {
            calories: 0,
            protein: 0,
        }
    );

    const calories = Math.round(nutrition.calories);
    const protein = Math.round(nutrition.protein * 10) / 10;
    const exercisesCompleted = exerciseLogs.length;
    const caloriePercentage = Math.min(
        100,
        Math.round((calories / targets.calories) * 100)
    );
    const proteinPercentage = Math.min(
        100,
        Math.round((protein / targets.protein) * 100)
    );
    const exercisePercentage = Math.min(
        100,
        Math.round((exercisesCompleted / targets.exercises) * 100)
    );
    const completionPercentage = Math.round(
        (caloriePercentage + proteinPercentage +
            Math.min(100, water.percentage) + exercisePercentage) / 4
    );

    const summary = {
        calories: {
            consumed: calories,
            goal: targets.calories,
            percentage: caloriePercentage,
        },
        protein: {
            consumed: protein,
            goal: targets.protein,
            percentage: proteinPercentage,
        },
        water: {
            consumed: water.consumed,
            goal: water.goal,
            percentage: Math.min(100, water.percentage),
        },
        exercises_completed: exercisesCompleted,
        progress: {
            fitness_goal: preferences?.fitness_goal || "Wellness",
            activity_level: preferences?.activity_level || null,
            completion_percentage: completionPercentage,
        },
    };
    const fallbackInsight = getFallbackInsight(summary);
    const generatedInsight = await aiService.generateResponse(
        `Create one concise daily wellness insight and one suggested next action. Focus on the user's current progress and fitness goal. Do not include a greeting or repeat the raw data.`,
        summary
    );
    const insights = generatedInsight ===
        "I’m unable to reach the AI assistant right now. Please try again shortly."
        ? fallbackInsight
        : generatedInsight;

    return {
        ...summary,
        insights,
        suggested_action: fallbackInsight,
    };
}

module.exports = {
    getDailyWellnessSummary,
};
