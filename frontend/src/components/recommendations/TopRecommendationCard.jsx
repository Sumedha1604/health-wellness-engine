import {
  Star,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export default function TopRecommendationCard({
  recommendation,
  onAddToMealPlan,
  feedback = {},
  onFeedback,
}) {
  const isObject = recommendation && typeof recommendation !== "string";

  const displayName = isObject
    ? recommendation.food_name || "Recommended Food"
    : recommendation;

  const recommendationId = `top-${
    isObject ? recommendation.food_id || displayName : displayName
  }`;

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

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onFeedback?.(recommendationId, "like")}
          aria-pressed={feedback[recommendationId] === "like"}
          className={
            feedback[recommendationId] === "like"
              ? "flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition"
              : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-green-50 hover:text-green-700"
          }
        >
          <ThumbsUp size={16} />
          Like
        </button>

        <button
          type="button"
          onClick={() => onFeedback?.(recommendationId, "dislike")}
          aria-pressed={feedback[recommendationId] === "dislike"}
          className={
            feedback[recommendationId] === "dislike"
              ? "flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition"
              : "flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          }
        >
          <ThumbsDown size={16} />
          Dislike
        </button>
      </div>
    </div>
  );
}
