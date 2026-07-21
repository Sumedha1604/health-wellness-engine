import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getExercises } from "../services/exercise.service";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../services/favorite.service";
import ExerciseCard from "../components/exercises/ExerciseCard";
import toast from "react-hot-toast";

const PAGE_LIMIT = 12;
const FILTER_OPTIONS_LIMIT = 1000;

export default function Exercises() {

  const [exercises, setExercises] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [bodyPart, setBodyPart] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const [bodyPartOptions, setBodyPartOptions] = useState(["All"]);
  const [equipmentOptions, setEquipmentOptions] = useState(["All"]);
  const [difficultyOptions, setDifficultyOptions] = useState(["All"]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);


  useEffect(() => {
    loadFavorites();
  }, []);


  useEffect(() => {
    loadFilterOptions();
  }, []);


  useEffect(() => {

    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);

  }, [search]);


  useEffect(() => {
    setPage(1);
  }, [bodyPart, equipment, difficulty]);


  useEffect(() => {
    loadExercises();
  }, [debouncedSearch, bodyPart, equipment, difficulty, page]);


  async function loadFavorites() {

    try {

      const favoriteData = await getFavorites();

      setFavorites(
        favoriteData.filter(
          (favorite) => favorite.exercise_id
        )
      );

    } catch (err) {

      console.error(err);

    }

  }


  async function loadFilterOptions() {

    try {

      const response = await getExercises({
        page: 1,
        limit: FILTER_OPTIONS_LIMIT,
      });

      const allExercises = response.data;

      const uniqueBodyParts = Array.from(
        new Set(
          allExercises
            .map((exercise) => exercise.body_part)
            .filter(Boolean)
        )
      ).sort();

      const uniqueEquipment = Array.from(
        new Set(
          allExercises
            .map((exercise) => exercise.equipment)
            .filter(Boolean)
        )
      ).sort();

      const uniqueDifficulties = Array.from(
        new Set(
          allExercises
            .map((exercise) => exercise.difficulty_level)
            .filter(Boolean)
        )
      ).sort();

      setBodyPartOptions(["All", ...uniqueBodyParts]);
      setEquipmentOptions(["All", ...uniqueEquipment]);
      setDifficultyOptions(["All", ...uniqueDifficulties]);


    } catch (err) {

      console.error(err);

    }

  }


  async function loadExercises() {

    try {

      setLoading(true);
      setError(null);

      const response = await getExercises({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch || undefined,
        body_part:
          bodyPart !== "All" ? bodyPart : undefined,
        equipment:
          equipment !== "All" ? equipment : undefined,
        difficulty:
          difficulty !== "All" ? difficulty : undefined,
      });

      setExercises(response.data);
      setTotal(response.total);


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


  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_LIMIT)
  );


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


      <div className="
        rounded-3xl
        bg-white
        p-6
        shadow-card
        space-y-4
      ">

        <div className="relative">

          <Search
            className="
              absolute
              left-4
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by title, body part, or equipment..."
            className="
              w-full
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              py-3
              pl-11
              pr-4
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />

        </div>


        <div className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
        ">

          <select
            value={bodyPart}
            onChange={(event) =>
              setBodyPart(event.target.value)
            }
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2.5
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          >

            {bodyPartOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All"
                  ? "All body parts"
                  : option}
              </option>
            ))}

          </select>


          <select
            value={equipment}
            onChange={(event) =>
              setEquipment(event.target.value)
            }
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2.5
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          >

            {equipmentOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All"
                  ? "All equipment"
                  : option}
              </option>
            ))}

          </select>


          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value)
            }
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2.5
              text-sm
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          >

            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option === "All"
                  ? "All difficulties"
                  : option}
              </option>
            ))}

          </select>

        </div>

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


      ) : exercises.length === 0 ? (

        <div className="
          flex
          min-h-[320px]
          items-center
          justify-center
          rounded-3xl
          bg-white
          shadow-card
        ">

          <p className="text-gray-500 font-medium">
            No exercises match your search or filters.
          </p>

        </div>


      ) : (

        <>

          <div className="
            flex
            items-center
            justify-center
            gap-4
          ">

            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
              disabled={page <= 1}
              className="
                flex
                items-center
                gap-1
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                shadow-card
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              <ChevronLeft size={16}/>

              Previous

            </button>


            <span className="text-sm font-medium text-gray-600">
              Page {page} of {totalPages}
            </span>


            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              disabled={page >= totalPages}
              className="
                flex
                items-center
                gap-1
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                shadow-card
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              Next

              <ChevronRight size={16}/>

            </button>

          </div>


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

        </>

      )}


    </div>

  );

}