import {
  Dumbbell,
  Activity,
  Target,
  Wrench,
  Gauge,
  Star,
  Heart,
  Check,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
  onLogWorkout,
  isLoggingWorkout,
}) {

  const [durationMinutes, setDurationMinutes] = useState("30");
  const [caloriesBurned, setCaloriesBurned] = useState("200");
  const [logError, setLogError] = useState(null);


  async function handleLogWorkout(event) {

    event.preventDefault();

    const duration = Number(durationMinutes);
    const calories = Number(caloriesBurned);

    if (!Number.isInteger(duration) || duration < 1) {
      setLogError("Enter a duration of at least 1 minute.");
      return;
    }

    if (
      caloriesBurned === "" ||
      !Number.isFinite(calories) ||
      calories < 0
    ) {
      setLogError("Enter calories burned as 0 or more.");
      return;
    }

    try {

      setLogError(null);

      await onLogWorkout(exercise, duration, calories);

    } catch {

      setLogError("Unable to log this workout. Please try again.");

    }

  }

  return (
    <div
      className="
        wellness-card
        p-6
        transition-all duration-200
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-wellness-mist
          "
        >
          <Dumbbell
            className="h-6 w-6 text-wellness-slate"
            strokeWidth={2}
          />
        </div>


        <div className="min-w-0 flex-1">

          <h3
            className="
              text-xl
              font-bold
              text-wellness-slate
              tracking-tight
              line-clamp-2
              break-words
            "
          >
            {exercise.title}
          </h3>

          <p className="mt-1 text-sm text-[#6b8582] truncate">
            {exercise.exercise_type}
          </p>

        </div>

      </div>


      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">

        <div
          className="
            flex
            items-center
            gap-1
            rounded-full
            bg-wellness-mist
            px-3
            py-1.5
            text-sm
            font-semibold
            text-wellness-slate
            shrink-0
            whitespace-nowrap
          "
        >
          <Star
            className="h-4 w-4 fill-wellness-aqua text-wellness-aqua"
            strokeWidth={2}
          />

          {exercise.rating ?? "N/A"}

        </div>


        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(exercise);
          }}
          className="
            flex
            items-center
            gap-1.5
            shrink-0
            whitespace-nowrap
            rounded-full
            bg-wellness-mist
            px-3
            py-2
            transition-colors
            hover:bg-wellness-teal/25
          "
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >

          <Heart
            className={
              isFavorite
                ? "h-5 w-5 fill-wellness-aqua text-wellness-aqua shrink-0"
                : "h-5 w-5 text-gray-400 shrink-0"
            }
            strokeWidth={2}
          />

          <span
            className={
              isFavorite
                ? "text-sm font-medium text-wellness-slate"
                : "text-sm font-medium text-gray-500"
            }
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </span>

        </button>

      </div>


      {onLogWorkout ? (

        <form
          onSubmit={handleLogWorkout}
          className="mt-4 rounded-2xl bg-wellness-mist p-4"
        >

          <p className="text-sm font-semibold text-wellness-slate">
            Log this workout
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <label className="text-xs font-medium text-gray-600">
              Duration (min)
              <input
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                disabled={isLoggingWorkout}
                className="mt-1 w-full rounded-xl border border-wellness-teal/25 bg-white px-3 py-2 text-sm text-wellness-slate outline-none transition focus:border-wellness-aqua"
              />
            </label>

            <label className="text-xs font-medium text-gray-600">
              Calories burned
              <input
                type="number"
                min="0"
                step="1"
                value={caloriesBurned}
                onChange={(event) => setCaloriesBurned(event.target.value)}
                disabled={isLoggingWorkout}
                className="mt-1 w-full rounded-xl border border-wellness-teal/25 bg-white px-3 py-2 text-sm text-wellness-slate outline-none transition focus:border-wellness-aqua"
              />
            </label>

          </div>

          {logError ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              {logError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoggingWorkout}
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-wellness-slate
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-[#2e4747]
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >

            {isLoggingWorkout ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            )}

            {isLoggingWorkout ? "Logging workout..." : "Log Workout"}

          </button>

        </form>

      ) : null}


      <div
        className="
          mt-6
          space-y-3
          text-sm
          text-gray-600
        "
      >

        <p className="flex items-center gap-3">

          <Activity
            className="h-4 w-4 text-green-600 shrink-0"
          />

          <span className="min-w-0 truncate">
            <span className="font-medium text-gray-700">
              Type:
            </span>{" "}
            {exercise.exercise_type}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Target
            className="h-4 w-4 text-green-600 shrink-0"
          />

          <span className="min-w-0 truncate">
            <span className="font-medium text-gray-700">
              Body part:
            </span>{" "}
            {exercise.body_part}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Wrench
            className="h-4 w-4 text-green-600 shrink-0"
          />

          <span className="min-w-0 truncate">
            <span className="font-medium text-gray-700">
              Equipment:
            </span>{" "}
            {exercise.equipment}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Gauge
            className="h-4 w-4 text-green-600 shrink-0"
          />

          <span className="min-w-0 truncate">
            <span className="font-medium text-gray-700">
              Difficulty:
            </span>{" "}
            {exercise.difficulty_level}
          </span>

        </p>


      </div>

    </div>
  );
}
