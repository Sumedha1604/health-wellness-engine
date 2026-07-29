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
  onView,
}) {

  const navigate = useNavigate();

  return (

    <div className="wellness-card p-6 sm:p-8">

      <div className="mb-8">

        <p className="wellness-eyebrow">Move with confidence</p>
        <h2 className="mt-1 text-2xl font-semibold text-wellness-slate">
          Recommended Exercises
        </h2>

        <p className="mt-1 text-[#6b8582]">
          AI-powered workouts based on your activity patterns
        </p>

      </div>


      {
        exercises.length === 0 ? (

          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wellness-teal/30 bg-white px-6 py-12 text-center">
            <Dumbbell className="h-8 w-8 text-wellness-aqua"/>
            <p className="mt-3 font-semibold text-wellness-slate">
              No exercise recommendations yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#6b8582]">
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
                    rounded-wellness
                    border border-wellness-teal/15 bg-white
                    p-6
                    hover:shadow-hover
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
                        bg-[#e1f8fd]
                      "
                    >
                      <Dumbbell
                        className="h-7 w-7 text-wellness-aqua"
                      />
                    </div>


                    <div
                      className="
                        flex items-center gap-1
                        rounded-full
                        bg-wellness-mist
                        px-3 py-1.5
                        text-wellness-teal
                      "
                    >
                      <BadgeCheck size={16}/>

                      <span className="text-xs font-semibold">
                        AI Match
                      </span>

                    </div>

                  </div>


                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-wellness-slate">
                    {exercise.title}
                  </h3>


                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="
                      rounded-full
                      bg-[#e1f8fd]
                      px-3 py-1
                      text-xs
                      font-medium
                      text-wellness-aqua
                    ">
                      {exercise.body_part}
                    </span>


                    <span className="
                      rounded-full
                      bg-[#f7eaec]
                      px-3 py-1
                      text-xs
                      font-medium
                      text-wellness-mauve
                    ">
                      {exercise.equipment}
                    </span>


                    <span className="
                      rounded-full
                      bg-wellness-cream
                      px-3 py-1
                      text-xs
                      font-medium
                      text-wellness-slate
                    ">
                      {exercise.difficulty_level}
                    </span>

                  </div>


                  <div className="mt-6 grid gap-2 text-sm text-[#526e6b] sm:grid-cols-2">


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


                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6b8582]">
                      <span>Recommendation score</span>
                      <span className="text-wellness-aqua">{score}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-[#eaf1f0]">

                      <div
                        className="
                          h-2
                          rounded-full
                          bg-wellness-aqua
                        "
                        style={{
                          width: `${score}%`
                        }}
                      />

                    </div>

                  </div>


                  <div className="mt-5 rounded-2xl bg-wellness-mist p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-wellness-teal">
                      Why this was recommended
                    </p>
                    <p className="mt-1 text-sm leading-6 text-wellness-slate">
                      {exercise.reason || "Selected to support your current wellness preferences."}
                    </p>
                  </div>


                  <button
                    onClick={() => {
                      onView?.(exercise.exercise_id);
                      navigate(`/exercises?exercise_id=${exercise.exercise_id}`);
                    }}
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      bg-wellness-slate
                      py-3
                      text-white
                      font-semibold
                      hover:bg-[#2e4747]
                      transition
                    "
                  >
                    View Exercise
                  </button>


                  <div className="mt-4 flex items-center justify-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        onFeedback?.(
                          "exercise",
                          exercise.exercise_id,
                          "like"
                        )
                      }
                      aria-pressed={
                        feedback[recommendationId] === "like"
                      }
                      className={
                        feedback[recommendationId] === "like"
                          ? "flex items-center gap-1.5 rounded-full bg-wellness-mist px-3 py-2 text-sm font-medium text-wellness-teal transition"
                          : "flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#6b8582] ring-1 ring-wellness-teal/15 transition hover:bg-wellness-mist hover:text-wellness-teal"
                      }
                    >
                      <ThumbsUp size={16}/>
                      Like
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        onFeedback?.(
                          "exercise",
                          exercise.exercise_id,
                          "dislike"
                        )
                      }
                      aria-pressed={
                        feedback[recommendationId] === "dislike"
                      }
                      className={
                        feedback[recommendationId] === "dislike"
                          ? "flex items-center gap-1.5 rounded-full bg-[#f7eaec] px-3 py-2 text-sm font-medium text-wellness-mauve transition"
                          : "flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#6b8582] ring-1 ring-wellness-mauve/15 transition hover:bg-[#f7eaec] hover:text-wellness-mauve"
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
