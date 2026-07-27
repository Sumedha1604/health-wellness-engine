import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  BadgeCheck,
  Target,
  Wrench,
  Gauge,
  Activity,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";


export default function RecommendedExercises({
  exercises = [],
  feedback = {},
  onFeedback,
}) {

  const navigate = useNavigate();

  return (

    <div className="bg-white rounded-3xl shadow-card p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          Recommended Exercises
        </h2>

        <p className="mt-1 text-gray-500">
          AI-powered workouts based on your activity patterns
        </p>

      </div>


      {
        exercises.length === 0 ? (

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <Dumbbell className="h-8 w-8 text-blue-500"/>
            <p className="mt-3 font-semibold text-gray-800">
              No exercise recommendations yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Your next personalized workout matches will appear here.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {exercises.map((exercise) => {

              const score = Math.round(
                (exercise.score || 0) * 100
              );

              const recommendationId =
                `exercise-${exercise.exercise_id}`;


              return (

                <div
                  key={exercise.exercise_id}
                  className="
                    rounded-3xl
                    border border-gray-100
                    p-6
                    hover:shadow-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                  "
                >

                  <div className="flex justify-between items-start">

                    <div
                      className="
                        flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-blue-50
                      "
                    >
                      <Dumbbell
                        className="h-7 w-7 text-blue-600"
                      />
                    </div>


                    <div
                      className="
                        flex items-center gap-1
                        rounded-full
                        bg-green-50
                        px-3 py-1.5
                        text-green-600
                      "
                    >
                      <BadgeCheck size={16}/>

                      <span className="text-xs font-semibold">
                        AI Match
                      </span>

                    </div>

                  </div>


                  <h3 className="mt-5 text-xl font-semibold text-gray-900">
                    {exercise.title}
                  </h3>


                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="
                      rounded-full
                      bg-blue-50
                      px-3 py-1
                      text-xs
                      font-medium
                      text-blue-600
                    ">
                      {exercise.body_part}
                    </span>


                    <span className="
                      rounded-full
                      bg-purple-50
                      px-3 py-1
                      text-xs
                      font-medium
                      text-purple-600
                    ">
                      {exercise.equipment}
                    </span>


                    <span className="
                      rounded-full
                      bg-orange-50
                      px-3 py-1
                      text-xs
                      font-medium
                      text-orange-600
                    ">
                      {exercise.difficulty_level}
                    </span>

                  </div>


                  <div className="mt-6 space-y-3 text-sm text-gray-600">


                    <div className="flex items-center gap-2">
                      <Target size={16}/>
                      <span>
                        Target muscle: {exercise.body_part}
                      </span>
                    </div>


                    <div className="flex items-center gap-2">
                      <Wrench size={16}/>
                      <span>
                        Equipment: {exercise.equipment}
                      </span>
                    </div>


                    <div className="flex items-center gap-2">
                      <Gauge size={16}/>
                      <span>
                        Level: {exercise.difficulty_level}
                      </span>
                    </div>


                    <div className="flex items-center gap-2">
                      <Activity size={16}/>
                      <span>
                        Recommendation confidence: {score}%
                      </span>
                    </div>


                  </div>


                  <div className="mt-4">

                    <div className="h-2 rounded-full bg-gray-100">

                      <div
                        className="
                          h-2
                          rounded-full
                          bg-blue-500
                        "
                        style={{
                          width: `${score}%`
                        }}
                      />

                    </div>

                  </div>


                  <p className="mt-4 text-sm text-gray-500">
                    {exercise.reason}
                  </p>


                  <button
                    onClick={() =>
                      navigate(
                        `/exercises?exercise_id=${exercise.exercise_id}`
                      )
                    }
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      bg-blue-500
                      py-3
                      text-white
                      font-semibold
                      hover:bg-blue-600
                      transition
                    "
                  >
                    View Exercise
                  </button>


                  <div className="mt-4 flex items-center justify-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        onFeedback?.(recommendationId, "like")
                      }
                      aria-pressed={
                        feedback[recommendationId] === "like"
                      }
                      className={
                        feedback[recommendationId] === "like"
                          ? "flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition"
                          : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-green-50 hover:text-green-700"
                      }
                    >
                      <ThumbsUp size={16}/>
                      Like
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        onFeedback?.(recommendationId, "dislike")
                      }
                      aria-pressed={
                        feedback[recommendationId] === "dislike"
                      }
                      className={
                        feedback[recommendationId] === "dislike"
                          ? "flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition"
                          : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      }
                    >
                      <ThumbsDown size={16}/>
                      Dislike
                    </button>

                  </div>


                </div>

              );

            })}

          </div>

        )
      }


    </div>

  );

}
