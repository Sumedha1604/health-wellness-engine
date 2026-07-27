import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Flame, Loader2, Timer } from "lucide-react";
import {
  EXERCISE_LOGGED_EVENT,
  getTodayExercises,
} from "../../services/tracking.service";


export default function ExerciseHistory() {

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadExercises = useCallback(async () => {

    try {

      setLoading(true);

      const exerciseData = await getTodayExercises();

      setExercises(exerciseData);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }, []);


  useEffect(() => {
    const loadTimeout = window.setTimeout(loadExercises, 0);

    window.addEventListener(EXERCISE_LOGGED_EVENT, loadExercises);

    return () => {
      window.clearTimeout(loadTimeout);
      window.removeEventListener(EXERCISE_LOGGED_EVENT, loadExercises);
    };
  }, [loadExercises]);


  return (

    <div className="rounded-3xl bg-white p-8 shadow-card">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Today&apos;s Exercises
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your completed workout activity.
          </p>

        </div>


        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50">
          <Dumbbell className="h-5 w-5 text-green-600" />
        </span>

      </div>


      {loading ? (

        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>


      ) : exercises.length === 0 ? (

        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <Dumbbell className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-gray-800">
            No exercises completed today
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Log a workout to see it here.
          </p>
        </div>


      ) : (

        <div className="mt-6 space-y-3">

          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-green-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <Dumbbell className="h-5 w-5 text-green-600" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">
                  {exercise.title}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Timer size={14}/>
                    {exercise.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={14}/>
                    {exercise.calories_burned} kcal
                  </span>
                </div>
              </div>
            </div>
          ))}

        </div>

      )}

    </div>

  );

}
