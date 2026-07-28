import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Dumbbell, Flame, Loader2, Timer } from "lucide-react";
import { Link } from "react-router-dom";
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

    <div className="wellness-card overflow-hidden p-6 sm:p-8">

      <div className="-mx-6 -mt-6 mb-6 flex items-start justify-between bg-wellness-mauve px-6 py-5 text-white sm:-mx-8 sm:-mt-8 sm:px-8">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Movement today</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Today&apos;s Exercises
          </h2>

          <p className="mt-1 text-sm text-white/75">
            Your completed workout activity.
          </p>

        </div>


        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Dumbbell className="h-5 w-5 text-white" />
        </span>

      </div>


      {loading ? (

        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wellness-aqua" />
        </div>


      ) : exercises.length === 0 ? (

        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <Dumbbell className="h-9 w-9 text-wellness-teal" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-wellness-slate">
            No exercises completed today
          </p>
          <p className="mt-1 text-sm text-[#6b8582]">
            Log a workout to see it here.
          </p>
          <Link to="/exercises" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-wellness-slate px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2e4747]">
            Log Workout <ArrowRight size={15} />
          </Link>
        </div>


      ) : (

        <div className="mt-6 space-y-3">

          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center gap-4 rounded-2xl bg-wellness-mist p-4 transition-colors hover:bg-[#DDEEEB]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wellness-mist">
                <Dumbbell className="h-5 w-5 text-wellness-slate" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-wellness-slate">
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
