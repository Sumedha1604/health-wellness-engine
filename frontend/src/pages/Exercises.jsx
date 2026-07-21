import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getExercises } from "../services/exercise.service";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../services/favorite.service";
import ExerciseCard from "../components/exercises/ExerciseCard";
import toast from "react-hot-toast";

export default function Exercises() {

  const [exercises, setExercises] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    loadExercises();
  }, []);


  async function loadExercises() {

    try {

      setLoading(true);
      setError(null);

      const [
        exerciseData,
        favoriteData,
      ] = await Promise.all([
        getExercises(),
        getFavorites(),
      ]);


      setExercises(exerciseData);

      setFavorites(
        favoriteData.filter(
          (favorite) => favorite.exercise_id
        )
      );


    } catch (err) {

      console.error(err);
      setError("Unable to load exercises.");

    } finally {

      setLoading(false);

    }

  }


  function isFavorite(exerciseId) {

    return favorites.some(
      (favorite) =>
        favorite.exercise_id === exerciseId
    );

  }


  async function handleToggleFavorite(exercise) {

    const existingFavorite = favorites.find(
      (favorite) =>
        favorite.exercise_id === exercise.exercise_id
    );


    if (existingFavorite) {

      try {

        await deleteFavorite(
          existingFavorite.favorite_id
        );


        setFavorites((prev) =>
          prev.filter(
            (favorite) =>
              favorite.favorite_id !==
              existingFavorite.favorite_id
          )
        );

        toast.success("Removed from favorites!");

      } catch (err) {

        console.error(err);

        toast.error(
          err.response?.data?.message || "Failed to remove favorite."
        );

      }


    } else {

      try {

        const response = await addFavorite({
          exercise_id: exercise.exercise_id,
        });

        const createdFavorite = response.data || response;


        setFavorites((prev) => [
          ...prev,
          {
            favorite_id:
              createdFavorite.favorite_id,
            exercise_id:
              exercise.exercise_id,
          },
        ]);

        toast.success("Added to favorites!");

      } catch (err) {

        console.error(err);

        toast.error(
          err.response?.data?.message || "Failed to add favorite."
        );

      }

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

        <div className="
          flex
          min-h-[520px]
          items-center
          justify-center
          rounded-3xl
          bg-white
          shadow-card
        ">

          <div className="
            flex
            flex-col
            items-center
            gap-4
          ">

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

        <div className="
          flex
          min-h-[520px]
          items-center
          justify-center
          rounded-3xl
          bg-white
          shadow-card
        ">

          <p className="text-red-500 font-medium">
            {error}
          </p>

        </div>


      ) : (

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
        ">


          {exercises.map((exercise) => (

            <ExerciseCard
              key={
                exercise.exercise_id
              }

              exercise={{
                exercise_id:
                  exercise.exercise_id,

                title:
                  exercise.title,

                description:
                  exercise.description,

                exercise_type:
                  exercise.exercise_type,

                body_part:
                  exercise.body_part,

                equipment:
                  exercise.equipment,

                difficulty_level:
                  exercise.difficulty_level,

                rating:
                  exercise.rating,
              }}

              isFavorite={
                isFavorite(
                  exercise.exercise_id
                )
              }

              onToggleFavorite={() =>
                handleToggleFavorite(
                  exercise
                )
              }
            />

          ))}


        </div>

      )}


    </div>

  );

}