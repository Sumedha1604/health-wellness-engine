import { useEffect, useState } from "react";
import { Coffee, UtensilsCrossed, Soup, Apple, UtensilsCrossed as UtensilsIcon } from "lucide-react";
import { getRecentMeals } from "../../services/dashboard.service";

function getMealIcon(mealType) {
  const type = (mealType || "").toLowerCase();
  if (type.includes("breakfast")) return Coffee;
  if (type.includes("lunch")) return UtensilsCrossed;
  if (type.includes("dinner")) return Soup;
  if (type.includes("snack")) return Apple;
  return UtensilsIcon;
}

export default function RecentMeals() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function loadRecentMeals() {
      try {
        const data = await getRecentMeals();
        setMeals(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadRecentMeals();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-card p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            Recent Meals
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest logged meals
          </p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Meals */}
      {meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <UtensilsCrossed className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
          <p className="mt-4 text-base font-semibold text-gray-800">
            No meals logged today
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your meals to build healthy habits.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {meals.map((meal, index) => {
            const MealIcon = getMealIcon(meal.meal_type);
            const isLast = index === meals.length - 1;
            return (
              <div
                key={meal.meal_plan_id}
                className={`flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl
                            transition-all hover:bg-green-50
                            ${!isLast ? "border-b border-gray-100" : ""}`}
              >
                {/* Icon */}
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                  <MealIcon className="h-5 w-5 text-green-600" strokeWidth={2} />
                </span>

                {/* Center */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {meal.food_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {meal.meal_type} • {meal.quantity} serving
                    {meal.quantity > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Right */}
                {meal.calories != null && (
                  <span className="flex-shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {meal.calories} kcal
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}