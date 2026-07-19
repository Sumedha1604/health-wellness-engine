import { Star, CheckCircle } from "lucide-react";

export default function TopRecommendationCard({ recommendation }) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-card
        p-8
      "
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-green-600">
            Top Recommendation
          </p>

          <h2 className="text-3xl font-bold mt-2">
            🥗 {recommendation}
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