import {
  Dumbbell,
  BadgeCheck,
  Target,
  Wrench,
  Gauge,
} from "lucide-react";


export default function RecommendedExercises({
  exercises = [],
}) {

  return (

    <div className="bg-white rounded-3xl shadow-card p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          Recommended Exercises
        </h2>

        <p className="mt-1 text-gray-500">
          AI-powered workouts based on similar user activity
        </p>

      </div>


      {
        exercises.length === 0 ? (

          <p className="text-gray-500 text-sm">
            No exercise recommendations available yet.
          </p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {exercises.map((exercise) => (

              <div
                key={exercise.exercise_id}
                className="
                  rounded-2xl
                  border border-gray-100
                  p-6
                  hover:shadow-lg
                  transition
                "
              >

                <div className="flex justify-between items-start">

                  <div
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-xl
                      bg-blue-50
                    "
                  >
                    <Dumbbell
                      className="h-6 w-6 text-blue-600"
                    />
                  </div>


                  <div className="flex items-center gap-1 text-green-600">

                    <BadgeCheck size={17}/>

                    <span className="text-sm font-medium">
                      AI Match
                    </span>

                  </div>

                </div>


                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {exercise.title}
                </h3>


                <div className="mt-4 space-y-2 text-sm text-gray-500">

                  <div className="flex items-center gap-2">
                    <Target size={16}/>
                    <span>
                      Target: {exercise.body_part}
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
                      Difficulty: {exercise.difficulty_level}
                    </span>
                  </div>

                </div>


                <div className="mt-4 text-sm font-medium text-blue-600">

                  Similarity score:
                  {" "}
                  {Math.round(exercise.score * 100)}%

                </div>


                <p className="mt-3 text-sm text-gray-500">
                  {exercise.reason}
                </p>


                <button
                  className="
                    mt-5
                    w-full
                    rounded-xl
                    bg-blue-500
                    py-2.5
                    text-white
                    font-medium
                    hover:bg-blue-600
                    transition
                  "
                >
                  View Exercise
                </button>


              </div>

            ))}

          </div>

        )
      }


    </div>

  );

}