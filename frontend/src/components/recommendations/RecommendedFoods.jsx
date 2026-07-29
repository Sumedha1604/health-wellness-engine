import {
  Drumstick,
  Egg,
  Salad,
  Wheat,
  Fish,
  Apple,
  UtensilsCrossed,
  BadgeCheck,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";


export default function RecommendedFoods({
  foods = [],
  onAddToMealPlan,
  feedback = {},
  onFeedback,
}) {


  const foodIcons = {
    "Chicken Breast": Drumstick,
    "Eggs": Egg,
    "Greek Yogurt": UtensilsCrossed,
    "Broccoli": Salad,
    "Brown Rice": Wheat,
    "Salmon": Fish,
    "Oats": UtensilsCrossed,
    "Banana": Apple,
  };


  return (

    <div className="wellness-card p-6 sm:p-8">


      <div className="mb-8">

        <p className="wellness-eyebrow">Nourish your goal</p>
        <h2 className="mt-1 text-2xl font-semibold text-wellness-slate">
          Recommended Foods
        </h2>

        <p className="mt-1 text-[#6b8582]">
          AI-selected foods based on your nutrition profile
        </p>

      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {foods.length === 0 ? (

          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <UtensilsCrossed className="h-8 w-8 text-green-500" />
            <p className="mt-3 font-semibold text-gray-800">
              No food recommendations yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Keep logging meals and your next food matches will appear here.
            </p>
          </div>

        ) : foods.map((food, index) => {


          const isObject = typeof food !== "string";

          const hasNutritionDetails =
            isObject && food.caloric_value != null;


          const name = isObject
            ? food.food_name || "Recommended Food"
            : food;


          const FoodIcon =
            foodIcons[name] || UtensilsCrossed;


          const rawScore = isObject
            ? food.score ?? food.similarity_score ?? food.confidence
            : null;

          const score = typeof rawScore === "number"
            ? Math.min(100, Math.max(0, Math.round(rawScore <= 1 ? rawScore * 100 : rawScore)))
            : null;

          const foodId = isObject
            ? food.food_id ?? food.id
            : null;

          const category = isObject
            ? food.category || food.food_category || "Nutrition match"
            : "Nutrition match";

          const recommendationId = `food-${foodId}`;



          function handleAddClick() {
            if (!onAddToMealPlan) {
              return;
            }

            onAddToMealPlan(
              isObject
                ? {
                    food_id: food.food_id,
                    food_name: name,
                    caloric_value: food.caloric_value,
                  }
                : {
                    food_name: name,
                  }
            );
          }



          return (

            <div
              key={index}
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
                    bg-wellness-mist
                  "
                >

                  <FoodIcon
                    className="h-7 w-7 text-wellness-teal"
                  />

                </div>



                <div
                  className="
                    flex items-center gap-1
                    rounded-full
                    bg-wellness-cream
                    px-3 py-1.5
                    text-wellness-slate
                  "
                >

                  <BadgeCheck size={16}/>

                  <span className="text-xs font-semibold">
                    AI Match
                  </span>

                </div>


              </div>



              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-wellness-teal">
                    Food recommendation
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-wellness-slate">
                    {name}
                  </h3>
                </div>
                <span className="rounded-full border border-wellness-teal/15 bg-wellness-mist px-3 py-1 text-xs font-semibold text-wellness-teal">
                  Food
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-wellness-mist px-3 py-1 text-xs font-semibold text-wellness-teal">
                  {category}
                </span>
                <span className="rounded-full bg-wellness-cream px-3 py-1 text-xs font-semibold text-wellness-slate">
                  Nutrition profile
                </span>
              </div>



              {hasNutritionDetails && (

                <div className="mt-5 grid grid-cols-2 gap-3">


                  <div className="
                    rounded-xl
                    bg-[#e1f8fd]
                    p-3
                  ">

                    <p className="text-xs text-[#6b8582]">
                      Calories
                    </p>

                    <p className="font-semibold text-wellness-slate">
                      {food.caloric_value} kcal
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-[#f7eaec]
                    p-3
                  ">

                    <p className="text-xs text-[#6b8582]">
                      Protein
                    </p>

                    <p className="font-semibold text-wellness-slate">
                      {food.protein} g
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-wellness-mist
                    p-3
                  ">

                    <p className="text-xs text-[#6b8582]">
                      Carbs
                    </p>

                    <p className="font-semibold text-wellness-slate">
                      {food.carbohydrates} g
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-wellness-cream
                    p-3
                  ">

                    <p className="text-xs text-[#6b8582]">
                      Fat
                    </p>

                    <p className="font-semibold text-wellness-slate">
                      {food.fat} g
                    </p>

                  </div>


                </div>

              )}



              {score !== null && (

                <div className="mt-5">


                  <div className="flex justify-between text-sm mb-2">

                    <span className="text-[#6b8582]">
                      Recommendation score
                    </span>

                    <span className="font-semibold text-wellness-teal">
                      {score}%
                    </span>

                  </div>


                  <div className="h-2 rounded-full bg-[#eaf1f0]">

                    <div
                      className="
                        h-2
                        rounded-full
                          bg-wellness-teal
                      "
                      style={{
                        width: `${score}%`
                      }}
                    />

                  </div>


                </div>

              )}



              <div className="mt-5 rounded-2xl bg-wellness-mist p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-wellness-teal">
                  Why this was recommended
                </p>
                <p className="mt-1 text-sm leading-6 text-wellness-slate">
                  {isObject && food.reason
                    ? food.reason
                    : "Selected to complement your current nutrition profile."}
                </p>
              </div>



              <button
                onClick={handleAddClick}
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-wellness-slate
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#2e4747]
                "
              >
                Add to Meal Plan
              </button>


              <div className="mt-4 flex items-center justify-center gap-3">

                <button
                  type="button"
                  onClick={() =>
                    onFeedback?.(
                      "food",
                      foodId,
                      "like"
                    )
                  }
                  disabled={!foodId}
                  aria-pressed={
                    feedback[recommendationId] === "like"
                  }
                  className={
                    feedback[recommendationId] === "like"
                      ? "flex items-center gap-1.5 rounded-full bg-wellness-mist px-3 py-2 text-sm font-medium text-wellness-teal transition disabled:cursor-not-allowed disabled:opacity-50"
                      : "flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#6b8582] ring-1 ring-wellness-teal/15 transition hover:bg-wellness-mist hover:text-wellness-teal disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  <ThumbsUp size={16}/>
                  Like
                </button>


                <button
                  type="button"
                  onClick={() =>
                    onFeedback?.(
                      "food",
                      foodId,
                      "dislike"
                    )
                  }
                  disabled={!foodId}
                  aria-pressed={
                    feedback[recommendationId] === "dislike"
                  }
                  className={
                    feedback[recommendationId] === "dislike"
                      ? "flex items-center gap-1.5 rounded-full bg-[#f7eaec] px-3 py-2 text-sm font-medium text-wellness-mauve transition disabled:cursor-not-allowed disabled:opacity-50"
                      : "flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#6b8582] ring-1 ring-wellness-mauve/15 transition hover:bg-[#f7eaec] hover:text-wellness-mauve disabled:cursor-not-allowed disabled:opacity-50"
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


    </div>

  );

}
