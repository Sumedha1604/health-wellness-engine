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
    <section className="wellness-card p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="wellness-eyebrow">Nourishment</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-wellness-slate">
            Recent Meals
          </h2>
          <p className="mt-1 text-sm text-[#6b8582]">
            Your latest logged meals
          </p>
        </div>
      </div>

      {/* Meals */}
      {meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-14">
          <UtensilsCrossed className="h-10 w-10 text-wellness-teal/50" strokeWidth={1.5} />
          <p className="mt-4 text-base font-semibold text-wellness-slate">
            No meals logged today
          </p>
          <p className="mt-1 text-sm text-[#6b8582]">
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
                            transition-all hover:bg-wellness-mist
                            ${!isLast ? "border-b border-wellness-teal/10" : ""}`}
              >
                {/* Icon */}
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-wellness-mist">
                  <MealIcon className="h-5 w-5 text-wellness-teal" strokeWidth={2} />
                </span>

                {/* Center */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-wellness-slate">
                    {meal.food_name}
                  </p>
                  <p className="mt-0.5 text-sm text-[#6b8582]">
                    {meal.meal_type} • {meal.quantity} serving
                    {meal.quantity > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Right */}
                {meal.calories != null && (
                  <span className="flex-shrink-0 rounded-full bg-[#e1f8fd] px-3 py-1 text-sm font-semibold text-wellness-aqua">
                    {meal.calories} kcal
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
