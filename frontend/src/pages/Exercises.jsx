import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getExercises } from "../services/exercise.service";
import ExerciseCard from "../components/exercises/ExerciseCard";

export default function Exercises() {

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadExercises();
  }, []);


  async function loadExercises() {

    try {

      setLoading(true);
      setError(null);

      const data = await getExercises();

      setExercises(data);

    } catch (err) {

      console.error(err);
      setError("Unable to load exercises.");

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Exercises
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Browse exercises and improve your fitness routine.
        </p>
      </div>


      {loading ? (

        <div className="flex min-h-[520px] items-center justify-center rounded-3xl bg-white shadow-card">

          <div className="flex flex-col items-center gap-4">

            <Loader2
              className="h-8 w-8 animate-spin text-green-600"
              strokeWidth={2}
            />

            <p className="text-base font-semibold text-gray-800">
              Loading exercises...
            </p>

          </div>

        </div>


      ) : error ? (

        <div className="flex min-h-[520px] items-center justify-center rounded-3xl bg-white shadow-card">

          <p className="text-red-500 font-medium">
            {error}
          </p>

        </div>


      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {exercises.map((exercise) => (
           <ExerciseCard
            key={exercise.exercise_id}
            exercise={exercise}
            />
          ))}
        </div>

      )}

    </div>

  );

}
