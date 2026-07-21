import {
  Dumbbell,
  Activity,
  Target,
  Wrench,
  Gauge,
  Star,
  Heart,
} from "lucide-react";

export default function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
}) {

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-card
        p-6
        transition-all duration-200
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-green-50
            "
          >
            <Dumbbell
              className="h-6 w-6 text-green-600"
              strokeWidth={2}
            />
          </div>


          <div className="min-w-0">

            <h3
              className="
                text-xl
                font-bold
                text-gray-900
                tracking-tight
                line-clamp-2
              "
            >
              {exercise.title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {exercise.exercise_type}
            </p>

          </div>

        </div>


        <div className="flex items-center gap-2">

          <div
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-green-100
              px-3
              py-1.5
              text-sm
              font-semibold
              text-green-700
            "
          >
            <Star
              className="h-4 w-4 fill-green-600 text-green-600"
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
              gap-2
              h-10
              rounded-full
              bg-green-50
              px-3
              transition-colors
              hover:bg-green-100
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
                  ? "h-5 w-5 fill-green-600 text-green-600"
                  : "h-5 w-5 text-gray-400"
              }
              strokeWidth={2}
            />

            <span
              className={
                isFavorite
                  ? "text-sm font-medium text-green-600"
                  : "text-sm font-medium text-gray-500"
              }
            >
              {isFavorite ? "Favorited" : "Favorite"}
            </span>

          </button>

        </div>

      </div>


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
            className="h-4 w-4 text-green-600"
          />

          <span>
            <span className="font-medium text-gray-700">
              Type:
            </span>{" "}
            {exercise.exercise_type}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Target
            className="h-4 w-4 text-green-600"
          />

          <span>
            <span className="font-medium text-gray-700">
              Body part:
            </span>{" "}
            {exercise.body_part}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Wrench
            className="h-4 w-4 text-green-600"
          />

          <span>
            <span className="font-medium text-gray-700">
              Equipment:
            </span>{" "}
            {exercise.equipment}
          </span>

        </p>


        <p className="flex items-center gap-3">

          <Gauge
            className="h-4 w-4 text-green-600"
          />

          <span>
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