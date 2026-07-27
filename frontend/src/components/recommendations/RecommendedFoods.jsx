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

    <div className="bg-white rounded-3xl shadow-card p-8">


      <div className="mb-8">

        <h2 className="text-2xl font-semibold text-gray-900">
          Recommended Foods
        </h2>

        <p className="mt-1 text-gray-500">
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


          const name = isObject
            ? food.food_name || "Recommended Food"
            : food;


          const FoodIcon =
            foodIcons[name] || UtensilsCrossed;


          const score = isObject
            ? Math.round((food.similarity_score || 0) * 100)
            : null;

          const foodId = isObject
            ? food.food_id
            : null;

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
                    bg-green-50
                  "
                >

                  <FoodIcon
                    className="h-7 w-7 text-green-600"
                  />

                </div>



                <div
                  className="
                    flex items-center gap-1
                    rounded-full
                    bg-yellow-50
                    px-3 py-1.5
                    text-yellow-600
                  "
                >

                  <BadgeCheck size={16}/>

                  <span className="text-xs font-semibold">
                    AI Match
                  </span>

                </div>


              </div>



              <h3 className="mt-5 text-xl font-semibold text-gray-900">
                {name}
              </h3>



              {isObject && (

                <div className="mt-5 grid grid-cols-2 gap-3">


                  <div className="
                    rounded-xl
                    bg-orange-50
                    p-3
                  ">

                    <p className="text-xs text-gray-500">
                      Calories
                    </p>

                    <p className="font-semibold text-gray-900">
                      {food.caloric_value} kcal
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-blue-50
                    p-3
                  ">

                    <p className="text-xs text-gray-500">
                      Protein
                    </p>

                    <p className="font-semibold text-gray-900">
                      {food.protein} g
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-purple-50
                    p-3
                  ">

                    <p className="text-xs text-gray-500">
                      Carbs
                    </p>

                    <p className="font-semibold text-gray-900">
                      {food.carbohydrates} g
                    </p>

                  </div>



                  <div className="
                    rounded-xl
                    bg-red-50
                    p-3
                  ">

                    <p className="text-xs text-gray-500">
                      Fat
                    </p>

                    <p className="font-semibold text-gray-900">
                      {food.fat} g
                    </p>

                  </div>


                </div>

              )}



              {score !== null && (

                <div className="mt-5">


                  <div className="flex justify-between text-sm mb-2">

                    <span className="text-gray-500">
                      Similarity score
                    </span>

                    <span className="font-semibold text-green-600">
                      {score}%
                    </span>

                  </div>


                  <div className="h-2 rounded-full bg-gray-100">

                    <div
                      className="
                        h-2
                        rounded-full
                        bg-green-500
                      "
                      style={{
                        width: `${score}%`
                      }}
                    />

                  </div>


                </div>

              )}



              {isObject && food.reason && (

                <p className="mt-4 text-sm text-gray-500">
                  {food.reason}
                </p>

              )}



              <button
                onClick={handleAddClick}
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-green-500
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-green-600
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
                      ? "flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition disabled:cursor-not-allowed disabled:opacity-50"
                      : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                      ? "flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition disabled:cursor-not-allowed disabled:opacity-50"
                      : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
