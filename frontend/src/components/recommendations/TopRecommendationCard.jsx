import {
  Star,
  UtensilsCrossed,
} from "lucide-react";

export default function TopRecommendationCard({
  recommendation,
  onAddToMealPlan,
}) {
  const isObject = recommendation && typeof recommendation !== "string";

  const displayName = isObject
    ? recommendation.food_name || "Recommended Food"
    : recommendation;

  function handleAddClick() {
    if (!onAddToMealPlan || !recommendation) {
      return;
    }

    onAddToMealPlan(
      isObject
        ? {
            food_id: recommendation.food_id,
            food_name: displayName,
            caloric_value: recommendation.caloric_value,
          }
        : {
            food_name: recommendation,
          }
    );
  }

  return (
    <div
      className="
        wellness-card
        p-6 sm:p-8
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="wellness-eyebrow">
            Top Recommendation
          </p>
          <h2 className="text-3xl font-bold mt-2 tracking-tight text-wellness-slate">
            {displayName}
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <Star
              size={18}
            className="text-wellness-aqua fill-wellness-aqua"
            />
            <span className="font-semibold">
              Personalized
            </span>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-2xl bg-wellness-mist p-4">
        <div className="flex items-center gap-3">
          <UtensilsCrossed
            size={18}
            className="text-wellness-teal"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-wellness-teal">
              Why it stands out
            </p>
            <p className="mt-1 text-sm leading-6 text-wellness-slate">
              {isObject && recommendation.reason
                ? recommendation.reason
                : "A personalized food suggestion selected to support today's nutrition plan."}
            </p>
          </div>
        </div>
      </div>

      {isObject && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-wellness-teal/10 p-3">
            <p className="text-xs font-medium text-[#6b8582]">Calories</p>
            <p className="mt-1 font-bold text-wellness-slate">{recommendation.caloric_value || 0} kcal</p>
          </div>
          <div className="rounded-2xl border border-wellness-teal/10 p-3">
            <p className="text-xs font-medium text-[#6b8582]">Protein</p>
            <p className="mt-1 font-bold text-wellness-slate">{recommendation.protein || 0} g</p>
          </div>
        </div>
      )}
      <button
        onClick={handleAddClick}
        className="
          mt-8
          w-full
          rounded-xl
          bg-wellness-slate
          text-white
          py-3
          font-semibold
          hover:bg-[#2e4747]
          transition
        "
      >
        Add to Meal Plan
      </button>

    </div>
  );
}
