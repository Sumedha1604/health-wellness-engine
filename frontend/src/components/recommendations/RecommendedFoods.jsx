import {
  Drumstick,
  Egg,
  Salad,
  Wheat,
  Fish,
  Apple,
  UtensilsCrossed,
  BadgeCheck,
  Flame,
  Dumbbell,
} from "lucide-react";


export default function RecommendedFoods({ foods = [], onAddToMealPlan }) {


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


        {foods.map((food, index) => {


          const isObject = typeof food !== "string";


          const name = isObject
            ? food.food_name || "Recommended Food"
            : food;


          const FoodIcon =
            foodIcons[name] || UtensilsCrossed;


          const score = isObject
            ? Math.round((food.similarity_score || 0) * 100)
            : null;



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


            </div>

          );


        })}


      </div>


    </div>

  );

}