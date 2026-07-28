import {
  Star,
  CheckCircle,
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
          <h2 className="text-3xl font-bold mt-2 text-wellness-slate">
            🥗 {displayName}
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
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle
            size={18}
            className="text-wellness-teal"
          />
          <p>Based on today's nutrition</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle
            size={18}
            className="text-wellness-teal"
          />
          <p>Matches your wellness goal</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle
            size={18}
            className="text-wellness-teal"
          />
          <p>Generated from your meal history</p>
        </div>
      </div>
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
