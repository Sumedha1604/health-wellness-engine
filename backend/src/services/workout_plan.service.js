const db = require("../config/db");
const recommendationService = require("./recommendation.service");
const aiService = require("./ai.service");
const BadRequestError = require("../errors/BadRequestError");

function getTrainingDays(activityLevel) {

    if (activityLevel === "Advanced") {
        return [1, 2, 4, 5, 6];
    }

    if (activityLevel === "Intermediate") {
        return [1, 3, 5, 6];
    }

    return [1, 3, 5];

}

function getWorkoutDetails(goal, activityLevel) {

    const durationMinutes = activityLevel === "Beginner" ? 30 :
        activityLevel === "Advanced" ? 50 : 40;

    if (goal === "Improve Endurance" || goal === "Weight Loss") {
        return {
            sets: 3,
            reps: "12-15",
            duration_minutes: durationMinutes,
        };
    }

    return {
        sets: activityLevel === "Beginner" ? 3 : 4,
        reps: goal === "Muscle Gain" ? "8-12" : "10-12",
        duration_minutes: durationMinutes,
    };

}

async function getFallbackExercises(goal, limit) {

    let exerciseTypes = ["Strength", "Cardio", "Plyometrics"];

    if (goal === "Muscle Gain") {
        exerciseTypes = ["Strength", "Powerlifting", "Olympic Weightlifting"];
    }

    if (goal === "Weight Loss" || goal === "Improve Endurance") {
        exerciseTypes = ["Cardio", "Plyometrics"];
    }

    const placeholders = exerciseTypes.map(() => "?").join(", ");
    const [rows] = await db.execute(
        `
        SELECT exercise_id, title, body_part, equipment, difficulty_level
        FROM exercises
        WHERE exercise_type IN (${placeholders})
        ORDER BY exercise_id
        LIMIT ${Number(limit)}
        `,
        exerciseTypes
    );

    return rows;

}

async function generateWorkoutPlan(userId) {

    const [[preferences]] = await db.execute(
        `
        SELECT fitness_goal, activity_level
        FROM preferences
        WHERE user_id = ?
        `,
        [userId]
    );

    if (!preferences) {
        throw new BadRequestError(
            "Set your fitness preferences before generating a workout plan"
        );
    }

    const [historyRows, recommendations] = await Promise.all([
        db.execute(
            `
            SELECT el.exercise_id
            FROM exercise_logs el
            WHERE el.user_id = ?
            ORDER BY el.completed_at DESC
            LIMIT 20
            `,
            [userId]
        ),
        recommendationService.generateRecommendations(userId),
    ]);
    const recentExerciseIds = new Set(
        historyRows[0].map((exercise) => Number(exercise.exercise_id))
    );
    const trainingDays = getTrainingDays(preferences.activity_level);
    const exercisesPerDay = preferences.activity_level === "Beginner" ? 2 : 3;
    const neededExercises = trainingDays.length * exercisesPerDay;
    const recommendedExercisesFromEngine = (
        recommendations.recommended_exercises || []
    ).map((exercise) => ({
        ...exercise,
        exercise_id: Number(exercise.exercise_id),
    }));
    let recommendedExercises = recommendedExercisesFromEngine;

    recommendedExercises = recommendedExercises.filter(
        (exercise) => !recentExerciseIds.has(exercise.exercise_id)
    );

    if (recommendedExercises.length < neededExercises) {
        const fallbackExercises = await getFallbackExercises(
            preferences.fitness_goal,
            neededExercises * 2
        );
        const existingExerciseIds = new Set(
            recommendedExercises.map((exercise) => exercise.exercise_id)
        );

        const fallbackCandidates = fallbackExercises.filter((exercise) => (
            !existingExerciseIds.has(exercise.exercise_id)
        ));
        const unseenFallbackExercises = fallbackCandidates.filter((exercise) => (
            !recentExerciseIds.has(exercise.exercise_id)
        ));

        recommendedExercises = [
            ...recommendedExercises,
            ...unseenFallbackExercises,
        ];

        if (recommendedExercises.length === 0) {
            recommendedExercises = fallbackCandidates;
        }
    }

    if (recommendedExercises.length === 0) {
        throw new BadRequestError("No exercises are available for this plan");
    }

    const title = `${preferences.fitness_goal} Weekly Workout Plan`;
    const workoutDetails = getWorkoutDetails(
        preferences.fitness_goal,
        preferences.activity_level
    );
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [planResult] = await connection.execute(
            `
            INSERT INTO workout_plans (user_id, title, goal, duration_weeks)
            VALUES (?, ?, ?, ?)
            `,
            [userId, title, preferences.fitness_goal, 1]
        );
        const planId = planResult.insertId;
        const planExercises = [];

        for (let dayIndex = 0; dayIndex < trainingDays.length; dayIndex++) {
            for (let exerciseIndex = 0; exerciseIndex < exercisesPerDay; exerciseIndex++) {
                const recommendationIndex = (
                    dayIndex * exercisesPerDay + exerciseIndex
                ) % recommendedExercises.length;
                const exercise = recommendedExercises[recommendationIndex];

                await connection.execute(
                    `
                    INSERT INTO workout_plan_exercises (
                        workout_plan_id,
                        exercise_id,
                        day_number,
                        sets,
                        reps,
                        duration_minutes
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        planId,
                        exercise.exercise_id,
                        trainingDays[dayIndex],
                        workoutDetails.sets,
                        workoutDetails.reps,
                        workoutDetails.duration_minutes,
                    ]
                );

                planExercises.push({
                    ...exercise,
                    day_number: trainingDays[dayIndex],
                    ...workoutDetails,
                });
            }
        }

        const explanation = await aiService.generateResponse(
            "Explain this weekly workout plan in two concise sentences. Mention how it supports the goal and remind the user to use good form.",
            {
                fitness_goal: preferences.fitness_goal,
                activity_level: preferences.activity_level,
                training_days: trainingDays.length,
                exercises: planExercises.map((exercise) => exercise.title),
            }
        );

        await connection.execute(
            "UPDATE workout_plans SET description = ? WHERE id = ?",
            [explanation, planId]
        );
        await connection.commit();

        return {
            id: planId,
            title,
            goal: preferences.fitness_goal,
            duration_weeks: 1,
            description: explanation,
            exercises: planExercises,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

}

async function getWorkoutPlans(userId) {

    const [rows] = await db.execute(
        `
        SELECT
            wp.id,
            wp.title,
            wp.goal,
            wp.duration_weeks,
            wp.description,
            wp.created_at,
            wp.completed_at,
            COUNT(wpe.id) AS exercise_count
        FROM workout_plans wp
        LEFT JOIN workout_plan_exercises wpe ON wpe.workout_plan_id = wp.id
        WHERE wp.user_id = ?
        GROUP BY wp.id
        ORDER BY wp.created_at DESC
        `,
        [userId]
    );

    return rows.map((plan) => ({
        ...plan,
        exercise_count: Number(plan.exercise_count),
    }));

}

async function getWorkoutPlanById(userId, planId) {

    const [plans] = await db.execute(
        `
        SELECT id, title, goal, duration_weeks, description, created_at, completed_at
        FROM workout_plans
        WHERE id = ? AND user_id = ?
        `,
        [planId, userId]
    );

    if (plans.length === 0) {
        return null;
    }

    const [exercises] = await db.execute(
        `
        SELECT
            wpe.id,
            wpe.exercise_id,
            wpe.day_number,
            wpe.sets,
            wpe.reps,
            wpe.duration_minutes,
            e.title,
            e.body_part,
            e.equipment,
            e.difficulty_level
        FROM workout_plan_exercises wpe
        INNER JOIN exercises e ON e.exercise_id = wpe.exercise_id
        WHERE wpe.workout_plan_id = ?
        ORDER BY wpe.day_number, wpe.id
        `,
        [planId]
    );

    return {
        ...plans[0],
        exercises,
    };

}

async function completeWorkoutPlan(userId, planId) {

    const [result] = await db.execute(
        `
        UPDATE workout_plans
        SET completed_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND completed_at IS NULL
        `,
        [planId, userId]
    );

    return result.affectedRows > 0;

}

module.exports = {
    generateWorkoutPlan,
    getWorkoutPlans,
    getWorkoutPlanById,
    completeWorkoutPlan,
    getTrainingDays,
    getWorkoutDetails,
};
