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
        bg-white
        rounded-3xl
        shadow-card
        p-8
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-600">
            Top Recommendation
          </p>
          <h2 className="text-3xl font-bold mt-2">
            🥗 {displayName}
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <Star
              size={18}
              className="text-yellow-500 fill-yellow-400"
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
            className="text-green-500"
          />
          <p>Based on today's nutrition</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle
            size={18}
            className="text-green-500"
          />
          <p>Matches your wellness goal</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle
            size={18}
            className="text-green-500"
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
          bg-green-500
          text-white
          py-3
          font-semibold
          hover:bg-green-600
          transition
        "
      >
        Add to Meal Plan
      </button>

    </div>
  );
}
