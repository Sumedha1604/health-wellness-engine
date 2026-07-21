import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  Flame,
  Loader2,
  Dumbbell,
  Utensils,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getFavorites,
  deleteFavorite,
} from "../services/favorite.service";

import ExerciseCard from "../components/exercises/ExerciseCard";


export default function Favorites() {

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("meals");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    loadFavorites();
  }, []);



  async function loadFavorites() {

    try {

      setLoading(true);
      setError(null);

      const data = await getFavorites();

      setFavorites(data);

    } catch (err) {

      console.error(err);
      setError("Unable to load favorites.");

    } finally {

      setLoading(false);

    }

  }



  async function handleRemove(favorite) {

    try {

      await deleteFavorite(
        favorite.favorite_id
      );

      toast.success(
        "Removed from favorites."
      );


      setFavorites((prev) =>
        prev.filter(
          (item) =>
            item.favorite_id !==
            favorite.favorite_id
        )
      );


    } catch (err) {

      console.error(err);

      toast.error(
        "Failed to remove favorite."
      );

    }

  }



  function formatCalories(calories) {

    return `${Math.round(calories)} kcal`;

  }



  function formatQuantity(quantity) {

    return Number(quantity) === 1
      ? "1 serving"
      : `${quantity} servings`;

  }



  function formatDate(date) {

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  }



  const mealFavorites =
    favorites.filter(
      (favorite) =>
        favorite.food_id
    );


  const exerciseFavorites =
    favorites.filter(
      (favorite) =>
        favorite.exercise_id
    );



  return (

    <div className="space-y-8">


      <div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Favorites
        </h1>

        <p className="mt-2 text-lg text-gray-500">
          Your saved meals and exercises.
        </p>

      </div>



      <div className="
        flex
        w-fit
        rounded-2xl
        bg-gray-100
        p-1
      ">


        <button
          onClick={() =>
            setActiveTab("meals")
          }
          className={`
            flex
            items-center
            gap-2
            rounded-xl
            px-5
            py-2.5
            text-sm
            font-medium
            transition-all
            ${
              activeTab === "meals"
              ? "bg-white text-green-600 shadow"
              : "text-gray-500"
            }
          `}
        >

          <Utensils size={16}/>

          Meals

        </button>



        <button
          onClick={() =>
            setActiveTab("exercises")
          }
          className={`
            flex
            items-center
            gap-2
            rounded-xl
            px-5
            py-2.5
            text-sm
            font-medium
            transition-all
            ${
              activeTab === "exercises"
              ? "bg-white text-green-600 shadow"
              : "text-gray-500"
            }
          `}
        >

          <Dumbbell size={16}/>

          Exercises

        </button>


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

          <Loader2
            className="h-8 w-8 animate-spin text-green-600"
          />

        </div>


      ) : error ? (

        <p className="text-red-500">
          {error}
        </p>


      ) : activeTab === "exercises" ? (

        exerciseFavorites.length === 0 ? (

          <div className="
            rounded-3xl
            bg-white
            p-10
            text-center
            shadow-card
          ">

            <Heart className="mx-auto h-12 w-12 text-green-600"/>

            <h2 className="mt-4 text-2xl font-semibold">
              No favorite exercises yet
            </h2>

          </div>

        ) : (

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">

            {exerciseFavorites.map(
              (exercise) => (

                <ExerciseCard
                  key={
                    exercise.favorite_id
                  }
                  exercise={{
                    favorite_id:
                      exercise.favorite_id,
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
                  isFavorite={true}
                  onToggleFavorite={handleRemove}
                />

              )
            )}

          </div>

        )

      ) : (


        mealFavorites.length === 0 ? (

          <div className="
            rounded-3xl
            bg-white
            p-10
            text-center
            shadow-card
          ">

            <Heart className="mx-auto h-12 w-12 text-green-600"/>

            <h2 className="mt-4 text-2xl font-semibold">
              No favorite meals yet
            </h2>

            <button
              onClick={() =>
                navigate("/meal-plans")
              }
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-green-600
                px-6
                py-3
                text-white
              "
            >

              Browse Meals

              <ArrowRight size={16}/>

            </button>

          </div>


        ) : (


          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">

            {mealFavorites.map(
              (favorite) => (

                <div
                  key={
                    favorite.favorite_id
                  }
                  className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-card
                  "
                >

                  <div className="flex justify-between">

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          favorite
                        )
                      }
                      aria-label="Remove from favorites"
                    >

                      <Heart
                        className="
                          fill-green-600
                          text-green-600
                        "
                      />

                    </button>

                    <span className="
                      rounded-full
                      bg-green-100
                      px-3
                      py-1
                      text-sm
                      text-green-700
                    ">
                      <Flame size={14} className="inline"/>
                      {" "}
                      {formatCalories(
                        favorite.caloric_value
                      )}
                    </span>

                  </div>


                  <h3 className="
                    mt-5
                    text-xl
                    font-bold
                  ">
                    {favorite.food_name}
                  </h3>


                  <p className="mt-2 text-gray-500">
                    {favorite.meal_type}
                  </p>


                  <p className="mt-2 text-sm text-gray-400">
                    {formatDate(
                      favorite.meal_date
                    )}
                  </p>


                </div>

              )
            )}

          </div>

        )

      )}


    </div>

  );
}