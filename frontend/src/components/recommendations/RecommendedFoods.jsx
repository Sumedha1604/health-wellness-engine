import {
  Drumstick,
  Egg,
  Salad,
  Wheat,
  Fish,
  Apple,
  UtensilsCrossed,
  BadgeCheck,
  Dumbbell,
} from "lucide-react";


export default function RecommendedFoods({ foods = [] }) {


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

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-semibold">
            Recommended Foods
          </h2>

          <p className="text-gray-500 mt-1">
            Best matches for your nutrition goals
          </p>

        </div>

      </div>


      <div className="grid grid-cols-2 gap-5">

        {foods.map((food, index) => {


          const name =
            typeof food === "string"
              ? food
              : food.item_type === "exercise"
                ? `Exercise ${food.item_id}`
                : food.food_name || "Recommended Item";


          const FoodIcon =
            foodIcons[name] ||
            (food.item_type === "exercise"
              ? Dumbbell
              : UtensilsCrossed);


          return (

            <div
              key={index}
              className="
                rounded-2xl
                border border-gray-100
                p-5
                hover:shadow-lg
                transition
              "
            >

              <div className="flex items-center justify-between">

                <span
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-xl bg-green-50
                  "
                >

                  <FoodIcon
                    className="h-6 w-6 text-green-600"
                  />

                </span>


                <div className="flex items-center gap-1 text-yellow-500">

                  <BadgeCheck
                    size={16}
                    className="fill-yellow-400 text-white"
                  />

                  <span className="font-semibold text-gray-700">
                    Recommended
                  </span>

                </div>

              </div>


              <h3 className="mt-4 text-lg font-semibold">
                {name}
              </h3>


              {typeof food !== "string" && food.reason && (

                <p className="mt-2 text-sm text-gray-500">
                  {food.reason}
                </p>

              )}


              <button
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-green-500
                  py-2.5
                  font-medium
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