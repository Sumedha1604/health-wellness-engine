const db = require("../config/db");

const DAILY_WATER_GOAL = 2500;

function formatDate(value) {

    if (typeof value === "string") {
        return value.slice(0, 10);
    }

    return new Date(value).toISOString().slice(0, 10);

}

function calculateCurrentStreak(activityDates) {

    const dates = new Set(
        activityDates.map((row) => formatDate(row.activity_date))
    );
    const currentDate = new Date();
    let streak = 0;

    while (dates.has(currentDate.toISOString().slice(0, 10))) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;

}

function buildHistory(waterRows, nutritionRows, exerciseRows) {

    const historyMap = {};

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().slice(0, 10);

        historyMap[dateKey] = {
            date: dateKey,
            water_ml: 0,
            calories: 0,
            protein: 0,
            workouts: 0,
        };
    }

    waterRows.forEach((row) => {
        const entry = historyMap[formatDate(row.log_date)];

        if (entry) {
            entry.water_ml = Number(row.water_ml);
        }
    });

    nutritionRows.forEach((row) => {
        const entry = historyMap[formatDate(row.log_date)];

        if (entry) {
            entry.calories = Math.round(Number(row.calories));
            entry.protein = Math.round(Number(row.protein) * 10) / 10;
        }
    });

    exerciseRows.forEach((row) => {
        const entry = historyMap[formatDate(row.log_date)];

        if (entry) {
            entry.workouts = Number(row.workouts);
        }
    });

    return Object.values(historyMap);

}

async function getProgressHistory(userId) {

    const [waterResult, nutritionResult, exerciseResult] = await Promise.all([
        db.execute(
            `
            SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') AS log_date, SUM(amount_ml) AS water_ml
            FROM water_logs
            WHERE user_id = ?
                AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE_FORMAT(logged_at, '%Y-%m-%d')
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT
                DATE_FORMAT(nl.logged_at, '%Y-%m-%d') AS log_date,
                SUM(f.caloric_value * nl.quantity) AS calories,
                SUM(f.protein * nl.quantity) AS protein
            FROM nutrition_logs nl
            INNER JOIN foods f ON nl.food_id = f.food_id
            WHERE nl.user_id = ?
                AND nl.logged_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE_FORMAT(nl.logged_at, '%Y-%m-%d')
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT DATE_FORMAT(completed_at, '%Y-%m-%d') AS log_date, COUNT(*) AS workouts
            FROM exercise_logs
            WHERE user_id = ?
                AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE_FORMAT(completed_at, '%Y-%m-%d')
            `,
            [userId]
        ),
    ]);

    return buildHistory(
        waterResult[0],
        nutritionResult[0],
        exerciseResult[0]
    );

}

async function getProgressOverview(userId) {

    const [
        workoutsResult,
        waterResult,
        averageWaterResult,
        caloriesResult,
        activityResult,
        history,
    ] = await Promise.all([
        db.execute(
            "SELECT COUNT(*) AS total_workouts FROM exercise_logs WHERE user_id = ?",
            [userId]
        ),
        db.execute(
            "SELECT COALESCE(SUM(amount_ml), 0) AS total_water FROM water_logs WHERE user_id = ?",
            [userId]
        ),
        db.execute(
            `
            SELECT COALESCE(AVG(daily_water), 0) AS average_daily_water
            FROM (
                SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') AS log_date, SUM(amount_ml) AS daily_water
                FROM water_logs
                WHERE user_id = ?
                GROUP BY DATE_FORMAT(logged_at, '%Y-%m-%d')
            ) AS daily_water_totals
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT COALESCE(SUM(f.caloric_value * nl.quantity), 0) AS calories_consumed
            FROM nutrition_logs nl
            INNER JOIN foods f ON nl.food_id = f.food_id
            WHERE nl.user_id = ?
            `,
            [userId]
        ),
        db.execute(
            `
            SELECT activity_date
            FROM (
                SELECT DATE_FORMAT(completed_at, '%Y-%m-%d') AS activity_date
                FROM exercise_logs WHERE user_id = ?
                UNION
                SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') AS activity_date
                FROM water_logs WHERE user_id = ?
                UNION
                SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') AS activity_date
                FROM nutrition_logs WHERE user_id = ?
            ) AS activity_days
            ORDER BY activity_date DESC
            `,
            [userId, userId, userId]
        ),
        getProgressHistory(userId),
    ]);

    const totalWorkouts = Number(workoutsResult[0][0].total_workouts);
    const totalWater = Number(waterResult[0][0].total_water);
    const averageDailyWater = Math.round(
        Number(averageWaterResult[0][0].average_daily_water)
    );
    const caloriesConsumed = Math.round(
        Number(caloriesResult[0][0].calories_consumed)
    );
    const goalsCompleted = history.filter((day) => (
        day.water_ml >= DAILY_WATER_GOAL && day.workouts > 0
    )).length;
    const workoutsThisWeek = history.reduce(
        (total, day) => total + day.workouts,
        0
    );
    const today = history[history.length - 1];
    const goalProgressPercentage = Math.min(
        100,
        Math.round(
            ((Math.min(today.water_ml / DAILY_WATER_GOAL, 1)) +
            (today.workouts > 0 ? 1 : 0)) / 2 * 100
        )
    );

    return {
        total_workouts: totalWorkouts,
        total_water: totalWater,
        average_daily_water: averageDailyWater,
        calories_consumed: caloriesConsumed,
        current_streak: calculateCurrentStreak(activityResult[0]),
        goals_completed: goalsCompleted,
        workouts_this_week: workoutsThisWeek,
        goal_progress_percentage: goalProgressPercentage,
    };

}

module.exports = {
    getProgressOverview,
    getProgressHistory,
    calculateCurrentStreak,
    buildHistory,
};
